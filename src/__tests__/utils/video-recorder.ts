import { Page } from 'puppeteer';
import * as path from 'path';
import * as fs from 'fs';
import { dirname } from 'path';

import videoStreamReader from './video-stream-reader';
import videoStreamWriter from './video-stream-writer';
import { PuppeteerScreenRecorderOptions } from './video-typings';

export const options: PuppeteerScreenRecorderOptions = {
	followNewTab: true,
	fps: 25,
	ffmpeg_Path: null, // Use system ffmpeg
	videoFrame: {
		width: 1280,
		height: 720,
	},
	videoCrf: 18,
	videoCodec: 'libx264',
	videoPreset: 'ultrafast',
	videoBitrate: 1000,
	autopad: {
		color: 'black',
	},
	quality: 100,
};

export class VideoRecorder {
	private outputPath: string;
	private isRecording: boolean = false;
	private streamReader?: videoStreamReader;
	private streamWriter?: videoStreamWriter;
	private isScreenCaptureEnded: boolean | null = null;

	/**
	 * @param testName - The name of the test to record.
	 * @param page - The page to record.
	 */
	constructor(
		testName: string,
		private page: Page
	) {
		// Generate unique filename with timestamp
		const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
		const sanitizedTestName = testName.replace(/[^a-zA-Z0-9]/g, '_');
		this.outputPath = path.join(
			process.cwd(),
			'src',
			'__tests__',
			'video-logs',
			`${sanitizedTestName}_${timestamp}.mp4`
		);
		// Create the directory if it doesn't exist
		fs.mkdirSync(dirname(this.outputPath), { recursive: true });
	}

	/**
	 * Start the video recording.
	 * @returns A promise that resolves when the recording is started.
	 */
	public async start(): Promise<void> {
		// Only record in CI environment or when VIDEO_RECORD env var is set
		if (!process.env.CI && !process.env.VIDEO_RECORD) {
			return Promise.resolve();
		}

		try {
			this.streamReader = new videoStreamReader(this.page, options);
			this.streamWriter = new videoStreamWriter(this.outputPath, options);

			// Stop the streams when the page is closed
			this.page.once('close', async () => await this.stopStreams());
			// Bind the stream reader to the writer
			this.streamReader.on('pageScreenFrame', (pageScreenFrame) => {
				this.streamWriter?.insert(pageScreenFrame);
			});
			// Stop the streams when the writer encounters an error
			this.streamWriter.once('videoStreamWriterError', () =>
				this.stopStreams()
			);
			// Start the recording
			this.isRecording = await this.streamReader?.start();
			console.log(`🎥 Video recording started => ${this.outputPath}`);
			//
		} catch (error: any) {
			console.warn(
				'❌ Failed to start video recording:',
				(error as Error).message
			);
		}
	}

	/**
	 * Stop the video recording.
	 * @returns A promise that resolves when the recording is stopped and
	 * returns the the file path and size if the file was created and has content
	 */
	public async stop(): Promise<{
		filePath: string;
		fileSize: number;
	} | null> {
		if (!this.isRecording) {
			return null;
		}

		try {
			this.isRecording = !(await this.stopStreams());
			console.log(`🎬 Video recording stopped => ${this.outputPath}`);

			// Check if file was created and has content
			if (fs.existsSync(this.outputPath)) {
				const stats = fs.statSync(this.outputPath);
				if (stats.size > 0) {
					return {
						filePath: this.outputPath,
						fileSize: stats.size,
					};
				}
			}
			return null;
		} catch (error) {
			console.warn(
				'❌ Failed to stop video recording:',
				(error as Error).message
			);
			return null;
		}
	}

	private async stopStreams(): Promise<boolean> {
		if (
			this.isScreenCaptureEnded !== null ||
			!this.streamReader ||
			!this.streamWriter
		) {
			return this.isScreenCaptureEnded!;
		}

		await this.streamReader.stop();
		this.isScreenCaptureEnded = await this.streamWriter.stop();
		return this.isScreenCaptureEnded;
	}
}
