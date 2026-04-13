const sectionMembersMaps = document.querySelectorAll<HTMLElement>('.spck-section-members-map');

sectionMembersMaps.forEach((section) => {
	const pins = section.querySelectorAll<HTMLButtonElement>('.spck-section-members-map__pin');
	const membersContainer = section.querySelector<HTMLElement>('.spck-section-members-map__members');
	const members = section.querySelectorAll<HTMLElement>('.spck-section-members-map__member');


	pins.forEach((pin) => {
		pin.addEventListener('click', () => {
			const indicesAttr = pin.dataset.memberIndices;
			if (!indicesAttr) return;

			const indices = indicesAttr.split(',').map((i) => parseInt(i, 10));
			const isActive = pin.classList.contains('-current');

			pins.forEach((p) => p.classList.remove('-current'));
			members.forEach((m) => m.classList.remove('-visible'));

			if (isActive) {
				section.classList.remove('-has-open-members');
				return;
			}

			pin.classList.add('-current');
			section.classList.add('-has-open-members');

			indices.forEach((index) => {
				const member = members[index];
				if (member) member.classList.add('-visible');
			});

			// Scroll to the members container (on mobile only)
			if (window.innerWidth < 768) {
				membersContainer?.scrollIntoView({ behavior: 'smooth' });
			}
		});
	});
});
