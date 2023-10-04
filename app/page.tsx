"use client";
import { useState, useEffect } from "react";

export default function Home() {
	const [userInput, setUserInput] = useState<string>("");
	const [suggestion, setSuggestion] = useState<string>("");
	const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(
		null
	);

	async function query(data: { [key: string]: any }): Promise<any> {
		try {
			const response = await fetch(
				"https://api-inference.huggingface.co/models/mistralai/Mistral-7B-v0.1",
				{
					headers: {
						Authorization:
							"Bearer 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",
						"Content-Type": "application/json",
					},
					method: "POST",
					body: JSON.stringify(data),
				}
			);
			const result = await response.json();
			return result;
		} catch (error) {
			return "";
		}
	}

	const getSuggestion = async () => {
		const huggingFaceresponse = await query({
			inputs: userInput,
		});
		const aiSuggestion = huggingFaceresponse[0]?.generated_text;
		setSuggestion(aiSuggestion);
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		const inputText = e.target.value;
		setUserInput(inputText);

		if (typingTimeout) {
			clearTimeout(typingTimeout);
		}

		if (inputText.length > 0) {
			const newTypingTimeout = setTimeout(() => {
				getSuggestion();
			}, 3000);

			setTypingTimeout(newTypingTimeout);
		}
	};

	const handleTabKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === "Tab") {
			e.preventDefault();
			setUserInput(suggestion);
			setSuggestion("");
		}
	};

	useEffect(() => {
		return () => {
			if (typingTimeout) {
				clearTimeout(typingTimeout);
			}
		};
	}, []);

	return (
		<main className="h-screen w-full">
			<div className="flex flex-col items-center justify-center h-full px-10">
				<h1 className="text-xl my-4 font-bold tracking-widest">
					Ai Suggestion
				</h1>
				<div className="relative">
					<textarea
						className="absolute inset-0 bg-transparent z-0 text-white w-[700px] p-4 outline-none "
						value={userInput}
						placeholder={suggestion ? suggestion : "Enter text"}
						onChange={handleInputChange}
						onKeyDown={handleTabKeyPress}
					></textarea>
					<textarea
						className=" bg-transparent text-gray-500 w-[700px] p-4 outline-none z-50"
						value={suggestion}
						readOnly
					></textarea>
				</div>
			</div>
		</main>
	);
}
