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

export function isMobile(): boolean {
	const mobileTest1 = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
	// https://coderwall.com/p/i817wa/one-line-function-to-detect-mobile-devices-with-javascript
	const mobileTest2 = (typeof (window.orientation) !== "undefined") || (navigator.userAgent.indexOf("IEMobile") !== -1);

	return mobileTest1 || mobileTest2;
}

export function downloadFile(filename: string, text: string): void {
	const element = document.createElement("a");
	element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(text));
	element.setAttribute("download", filename);
	element.style.display = "none";
	document.body.appendChild(element);
	element.click();
	document.body.removeChild(element);
}
