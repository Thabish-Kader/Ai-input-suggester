"use client";
import { useState, useEffect } from "react";

export default function Home() {
	const [userInput, setUserInput] = useState<string>("");
	const [suggestion, setSuggestion] = useState<string>("");
	const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(
		null
	);

	// Model from : https://huggingface.co/mistralai/Mistral-7B-v0.1?text=My+name+is+Thomas+and+my+main+goal+is+to+help+you%2C+the+home+cook+or+baker.++I+have+a+passion+for+cooking+this+is+so+natural+for+me%2C+I+don%E2%80%99t+have+to+really+think+about+it.++Some+people+can+sing+thua+s
	async function query(data: { [key: string]: any }): Promise<any> {
		try {
			const response = await fetch(
				"https://api-inference.huggingface.co/models/mistralai/Mistral-7B-v0.1",
				{
					headers: {
						Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
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
		console.log(aiSuggestion);
		const newAiSuggestion = aiSuggestion?.replace(/\n/g, "");

		setSuggestion(newAiSuggestion);
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		const inputText = e.target.value;
		setUserInput(inputText);
		setSuggestion("");
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
				<h1 className="text-4xl my-10 font-bold tracking-widest bg-gradient-to-r from-blue-600 via-purple-500 to-indigo-600 text-transparent bg-clip-text">
					Ai Suggestion
				</h1>
				<div className="relative">
					<textarea
						className="absolute border border-purple-500 rounded-lg inset-0 bg-transparent z-0 text-purple-500 w-[700px] p-4 outline-none "
						value={userInput}
						placeholder={suggestion ? suggestion : "Enter text"}
						onChange={handleInputChange}
						onKeyDown={handleTabKeyPress}
					/>
					<p className=" text-gray-500 w-[700px] p-4 outline-none z-50">
						{suggestion}
					</p>
				</div>
			</div>
		</main>
	);
}
