/**
 * For speed see: https://animate.style/#utilities
 */
export async function hideElement(element: HTMLElement, animation: string = "fadeOut", makeInvisibleOnly: boolean = false): Promise < void > {
	if (element.classList.contains(makeInvisibleOnly ? "invisible" : "d-none"))
		return Promise.resolve();

	const animations = ["animate__animated", "animate__" + animation, "animate__faster"];

	return new Promise((res: any) => {
		element.addEventListener("animationend", () => {
			element.classList.remove(...animations);
			element.classList.add(makeInvisibleOnly ? "invisible" : "d-none");
			res();
		}, {
			once: true
		});

		element.classList.add(...animations);
	});
}

/**
 * For speed see: https://animate.style/#utilities
 */
export async function showElement(element: HTMLElement, animation: string = "fadeIn"): Promise < void > {
	if (!element.classList.contains("d-none") && !element.classList.contains("invisible"))
		return Promise.resolve();

	const animations = ["animate__animated", "animate__" + animation, "animate__faster"];

	return new Promise((res: any) => {
		element.addEventListener("animationend", () => {
			element.classList.remove(...animations);
			res();
		}, {
			once: true
		});

		element.classList.remove("d-none", "invisible");
		element.classList.add(...animations);
	});
}

export function getFormData(element: HTMLFormElement): {
	[key: string]: string
} {
	const data: {
		[key: string]: string
	} = {};

	element.querySelectorAll("input").forEach(child => data[child.id] = child.value);

	return data;
}
