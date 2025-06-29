const OLLAMA_BASE_URL = 'http://localhost:11434';


const callOllama = async (prompt, model = 'llama2') => {
    try {
        const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: model,
                prompt: prompt,
                stream: false
            })
        });

        if (!response.ok) {
            throw new Error('Ollama API error');
        }

        const data = await response.json();
        return data.response;
    } catch (error) {
        console.error('Ollama API Error:', error);
        return null;
    }
};

// 1. Smart Group Naming
export const generateGroupName = async (projectName, projectDescription = '') => {
    const prompt = `Project name: "${projectName}"
Project description: "${projectDescription}"
Suggest a creative, short, and single-word group name for this project. Return only the name, do not provide an explanation.`;

    const result = await callOllama(prompt);
    return result ? result.trim().split(/\s|\n/)[0] : 'NewGroup';
};

// 2. Automatic File Categorization
export const categorizeFile = async (fileName, fileContent = '') => {
    const prompt = `File name: "${fileName}"
File content: "${fileContent.substring(0, 200)}..."
Classify this file into one of the following categories: "Code", "Report", "Presentation", "Design", "Documentation", "Data", "Other"
Return only the category name.`;

    const result = await callOllama(prompt);
    return result ? result.trim() : 'Other';
};

// 3. Simple Feedback Suggestions
export const generateFeedback = async (score, projectName = '') => {
    let prompt = '';
    
    if (score >= 90) {
        prompt = `The student scored ${score} points. This is a great result! Suggest a short, motivating feedback.`;
    } else if (score >= 70) {
        prompt = `The student scored ${score} points. This is a good result. Suggest constructive and encouraging feedback.`;
    } else if (score >= 50) {
        prompt = `The student scored ${score} points. This is an average result. Suggest feedback with improvement tips.`;
    } else {
        prompt = `The student scored ${score} points. This is a low result. Suggest gentle but constructive feedback.`;
    }

    const result = await callOllama(prompt);
    return result ? result.trim() : 'Thank you!';
};

// 4. Simple Assignment Summary Generator
export const generateAssignmentSummary = async (fileName, fileContent = '') => {
    const prompt = `File name: "${fileName}"
File content: "${fileContent.substring(0, 500)}..."
Summarize the content of this assignment file in 2-3 short sentences. Explain what was done and which topics were covered.`;

    const result = await callOllama(prompt);
    return result ? result.trim() : 'Summary could not be generated.';
};

// Test function 
export const testOllamaConnection = async () => {
    try {
        const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`);
        return response.ok;
    } catch (error) {
        return false;
    }
}; 