import {
	Config
} from "../../../index.js";
import {
	translate
} from "../index.js";

export const Box = (() => {
	let dragElement: HTMLElement | undefined;
	let dropValid: boolean = false;

	function createBox(parent: HTMLElement, before: HTMLElement): void {
		const box = document.createElement("div");
		box.classList.add("drag-box", "invisible");
		box.setAttribute("draggable", "true");

		box.addEventListener("dragover", (event) => {
			event.preventDefault();
			event.dataTransfer && (event.dataTransfer.dropEffect = "move");
			return false;
		}, false);

		box.addEventListener("drop", event => {
			if (!event.dataTransfer || !dragElement)
				return false;
			dropValid = true;

			parent.insertBefore(dragElement, box);
			dragElement.style.opacity = "";
			dragElement = undefined;

			Box.onAfterDrop(parent);
			Box.spawn(parent);

			return true;
		}, false);

		parent.insertBefore(box, before);
	}

	return {
		isDropValid: (): boolean => dropValid,
		spawn: (parent: HTMLElement): void => {
			parent.querySelectorAll(".drag-box").forEach(box => box.remove());

			const questions = Array.from(parent.querySelectorAll(".question-element"));

			if (questions.length === 0)
				return;

			createBox(parent, questions[0] as HTMLElement);
			questions.forEach(element => createBox(parent, element.nextSibling as HTMLElement));
		},
		startDrag: (parent: HTMLElement, questionElement: HTMLElement): void => {
			dragElement = questionElement;
			dropValid = false;

			const children = Array.from(parent.children);
			const selfIndex = children.findIndex(child => child === questionElement);

			for (let i = 0; i < children.length; i++)
				if (i - 1 !== selfIndex && i + 1 !== selfIndex)
					children[i].classList.remove("invisible");
		},
		reset: (parent: HTMLElement): void => {
			if (dragElement) {
				dragElement.style.opacity = "";
				dragElement = undefined;
			}

			const children = Array.from(parent.children);
			for (let i = 0; i < children.length; i++)
				if (children[i].classList.contains("drag-box"))
					children[i].classList.add("invisible");
		},
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		onAfterDrop: (_parent: HTMLElement): void => {
			throw new Error("Define 'onAfterDrop' function");
		},
	};
})();

export default class Question {
	public id: string | undefined;
	private _element: HTMLDivElement;
	private question: HTMLTextAreaElement;
	private answer: HTMLTextAreaElement;
	private type: HTMLSelectElement;

	public get element(): HTMLDivElement {
		return this._element;
	}

	constructor(parent: HTMLElement, onDelete ? : () => void) {
		const html = `
			<span class="icon-drag col-1 fs-5" draggable="true"></span>
			<div class="col-9 d-flex flex-column gap-2">
				<input class="form-control question" placeholder="${translate("Question")}..." type="text">
				<input class="form-control answer" placeholder="${translate("Answer")}..." type="text">
			</div>
			<div class="col-2">
				<select class="form-select overflow-hidden" size="2">
					<option value="BUZZER" selected>${translate("Buzzer")}</option>
					<option value="ESTIMATE">${translate("Estimate")}</option>
				</select>
			</div>
			<span class="icon-remove col-1 fs-5"></span>
		`;

		const element = document.createElement("div");
		element.classList.add("question-element", "row");
		element.innerHTML = html;

		this.question = element.querySelector(".question") as any;
		this.answer = element.querySelector(".answer") as any;
		this.type = element.querySelector("select") as any;

		const remove = element.querySelector(".icon-remove") as HTMLButtonElement;
		remove.addEventListener("click", () => {
			element.remove();
			Box.spawn(parent);
			onDelete && onDelete();
		});

		element.addEventListener("dragstart", event => {
			if (!event.dataTransfer)
				return;

			element.style.opacity = "0.4";
			event.dataTransfer.effectAllowed = "move";

			Box.startDrag(parent, element);
		}, false);

		element.addEventListener("dragend", () => {
			if (!Box.isDropValid())
				Box.reset(parent);
		}, false);

		this._element = element;
		parent.appendChild(element);
		Box.spawn(parent);
	}

	public getData(): Config.Question {
		if (!this.id)
			this.id = (window as any).uuidv4();

		return {
			answer: this.answer.value,
			id: this.id,
			question: this.question.value,
			type: this.type.value as any,
		};
	}

	public setData(data: Config.Question): void {
		this.answer.value = data.answer;
		this.id = data.id;
		this.question.value = data.question;
		this.type.value = data.type;
	}

	public highlight(): void {
		this.element.scrollIntoView();
		this.element.addEventListener("animationend", () => {
			this.element.classList.remove("highlight");
		}, {
			once: true
		});
		this.element.classList.add("highlight");
	}
}
