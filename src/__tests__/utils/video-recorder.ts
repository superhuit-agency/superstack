import { Page } from 'puppeteer';
import { PuppeteerScreenRecorder } from 'puppeteer-screen-recorder';
import * as path from 'path';
import * as fs from 'fs';

export class VideoRecorder {
	private recorder: PuppeteerScreenRecorder | null = null;
	private outputPath: string;
	private isRecording: boolean = false;

	constructor(private suiteName: string) {
		// Create video-logs directory if it doesn't exist
		const videosDir = path.join(
			process.cwd(),
			'src',
			'__tests__',
			'video-logs'
		);
		if (!fs.existsSync(videosDir)) {
			fs.mkdirSync(videosDir, { recursive: true });
		}

		// Generate unique filename with timestamp
		const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
		const sanitizedSuiteName = suiteName.replace(/[^a-zA-Z0-9]/g, '_');
		this.outputPath = path.join(
			videosDir,
			`${sanitizedSuiteName}_${timestamp}.mp4`
		);
	}

	async startRecording(page: Page): Promise<void> {
		// Only record in CI environment or when VIDEO_RECORD env var is set
		if (!process.env.CI && !process.env.VIDEO_RECORD) {
			return;
		}

		console.log('🎥 Starting video recording...');

		try {
			this.recorder = new PuppeteerScreenRecorder(page, {
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
			});

			await this.recorder.start(this.outputPath);
			this.isRecording = true;
			console.log(`🎥 Video recording started: ${this.outputPath}`);
		} catch (error) {
			console.warn(
				'❌ Failed to start video recording:',
				(error as Error).message
			);
		}
	}

	async stopRecording(): Promise<string | null> {
		if (!this.isRecording || !this.recorder) {
			return null;
		}

		try {
			await this.recorder.stop();
			this.isRecording = false;
			console.log(`🎬 Video recording stopped: ${this.outputPath}`);

			// Check if file was created and has content
			if (fs.existsSync(this.outputPath)) {
				const stats = fs.statSync(this.outputPath);
				if (stats.size > 0) {
					return this.outputPath;
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

	getOutputPath(): string {
		return this.outputPath;
	}

	get recording(): boolean {
		return this.isRecording;
	}

	cleanup(): void {
		// Clean up recorder instance
		this.recorder = null;
		this.isRecording = false;
	}
}
