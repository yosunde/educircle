import React, { useState } from 'react';
import { generateFeedback } from '../../services/aiService';

const AiFeedbackGenerator = ({ score, projectName, onFeedbackGenerated }) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [suggestedFeedback, setSuggestedFeedback] = useState('');

    const handleGenerateFeedback = async () => {
        setIsGenerating(true);
        try {
            const feedback = await generateFeedback(score, projectName);
            setSuggestedFeedback(feedback);
        } catch (error) {
            console.error('Feedback generation error:', error);
            setSuggestedFeedback('Thank you!');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleUseFeedback = () => {
        onFeedbackGenerated(suggestedFeedback);
    };

    return (
        <div style={{ marginTop: 10 }}>
            <button
                onClick={handleGenerateFeedback}
                disabled={isGenerating}
                style={{
                    background: '#28a745',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    cursor: isGenerating ? 'not-allowed' : 'pointer',
                    fontSize: '14px'
                }}
            >
                {isGenerating ? '🤖 AI Generating Feedback...' : '🤖 AI Feedback Suggestion'}
            </button>

            {suggestedFeedback && (
                <div style={{ marginTop: 10 }}>
                    <div style={{
                        background: '#f8f9fa',
                        border: '1px solid #dee2e6',
                        borderRadius: '6px',
                        padding: '12px',
                        marginBottom: 8
                    }}>
                        <p style={{ fontSize: '14px', color: '#666', marginBottom: 4 }}>
                            AI Suggestion:
                        </p>
                        <p style={{ fontSize: '14px', margin: 0 }}>
                            "{suggestedFeedback}"
                        </p>
                    </div>
                    <button
                        onClick={handleUseFeedback}
                        style={{
                            background: '#007bff',
                            color: 'white',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '13px'
                        }}
                    >
                        Use This Feedback
                    </button>
                </div>
            )}
        </div>
    );
};

export default AiFeedbackGenerator; 