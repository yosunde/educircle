import React, { useState } from 'react';
import { generateGroupName } from '../../services/aiService';

const AiGroupNamer = ({ projectName, projectDescription, onNameGenerated }) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [suggestedName, setSuggestedName] = useState('');

    const handleGenerateName = async () => {
        setIsGenerating(true);
        try {
            const name = await generateGroupName(projectName, projectDescription);
            setSuggestedName(name);
        } catch (error) {
            console.error('Error generating group name:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleNameSelect = () => {
        onNameGenerated(suggestedName);
    };

    return (
        <div style={{ marginTop: 10 }}>
            <button
                onClick={handleGenerateName}
                disabled={isGenerating}
                style={{
                    background: '#6a0dad',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    cursor: isGenerating ? 'not-allowed' : 'pointer',
                    fontSize: '14px'
                }}
            >
                {isGenerating ? '🤖 AI Group Name Generator is generating...' : '🤖 AI Group Name Generator'}
            </button>

            {suggestedName && (
                <div style={{ marginTop: 10 }}>
                    <p style={{ fontSize: '14px', color: '#666', marginBottom: 8 }}>
                        Suggested name:
                    </p>
                    <button
                        onClick={handleNameSelect}
                        style={{
                            background: '#f0f0f0',
                            border: '1px solid #ddd',
                            padding: '6px 12px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '13px'
                        }}
                    >
                        {suggestedName}
                    </button>
                </div>
            )}
        </div>
    );
};

export default AiGroupNamer; 