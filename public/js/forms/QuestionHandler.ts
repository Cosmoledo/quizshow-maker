import {
	Config
} from "../../../index.js";
import {
	hasPseudoClass
} from "./methods.js";
import Question, {
	Box
} from "./Question.js";

const questions: Question[] = [];

Box.onAfterDrop = (parent: HTMLElement) => {
	questions.sort((a, b) => {
		const aIndex = Array.from(parent.children)
			.findIndex(child => child === a.element);
		const bIndex = Array.from(parent.children)
			.findIndex(child => child === b.element);

		return aIndex - bIndex;
	});
};

const QuestionDetails = (() => {
	const modalElement = document.querySelector("#detailsModal") as HTMLDivElement;
	const modal: bootstrap.Modal = (window as any).bootstrap.Modal.getOrCreateInstance(modalElement);

	function set(data: any, path = ""): void {
		if (typeof (data) === "object")
			for (const key in data)
				set(data[key], path ? path + "-" + key : key);
		else {
			const element: HTMLInputElement | null = modalElement.querySelector(`[name="${path}"]`);

			if (!element) {
				console.error("Missing detail field:", path, data);
				return;
			}

			element.value = data + "";
		}
	}

	// https://stackoverflow.com/a/31976476
	function stringToObj(parts: string[], value: any, obj: any): void {
		const last = parts.pop() as string;
		let part: string;
		while ((part = parts.shift() as string)) {
			if (typeof obj[part] != "object")
				obj[part] = {};
			obj = obj[part];
		}
		obj[last] = value;
	}

	return {
		set,
		get(): Config.Settings {
			const elements = (Array.from(modalElement.querySelectorAll("[name]")) as HTMLInputElement[]);

			const settings: any = {};

			elements
				.forEach(element => {
					const key = element.getAttribute("name") as string;
					const value = element.value;

					stringToObj(key.split("-"), value, settings);
				});

			return settings;
		},
		validate(): boolean {
			const isValid = !Array.from(modalElement.querySelectorAll("input"))
				.some(element => hasPseudoClass(element, ":invalid"));

			if (!isValid)
				modal.show();

			return isValid;
		},
	};
})();

const questionsContainer = document.querySelector("#question-container") as HTMLDivElement;

function createQuestion(): Question {
	const q = new Question(questionsContainer, () => {
		questions.splice(questions.indexOf(q), 1);
	});

	questions.push(q);

	return q;
}

const QuestionHandler = {
	element: questionsContainer,
	tryCreateQuestion(): void {
		const lastQuestion = questions[questions.length - 1];
		const data = lastQuestion?.getData();

		if (!data || data.question.length > 0 || data.answer.length > 0) {
			createQuestion();
			questionsContainer.scrollTop = questionsContainer.scrollHeight;
		} else {
			lastQuestion.highlight();
		}
	},
	loadJson(json: Config.root): void {
		questionsContainer.innerHTML = "";
		questions.length = 0;

		json.questions.forEach(question => {
			const q = createQuestion();
			q.setData(question);
		});

		QuestionDetails.set(json.settings);
	},
	getJson(): Config.root {
		return {
			settings: QuestionDetails.get(),
			questions: questions.map(q => q.getData())
		};
	},
	validate(): boolean {
		if (!QuestionDetails.validate())
			return false;

		questionsContainer.classList.add("was-validated");
		const isValid = !Array.from(questionsContainer.querySelectorAll("input"))
			.some(element => {
				const invalid = hasPseudoClass(element, ":invalid");
				if (invalid)
					element.scrollIntoView();
				return invalid;
			});

		return isValid;
	},
};

export default QuestionHandler;
