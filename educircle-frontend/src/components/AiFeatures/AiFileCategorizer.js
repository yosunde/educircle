import React, { useState } from 'react';
import { categorizeFile } from '../../services/aiService';

const AiFileCategorizer = ({ fileName, fileContent, onCategoryGenerated }) => {
    const [isCategorizing, setIsCategorizing] = useState(false);
    const [suggestedCategory, setSuggestedCategory] = useState('');

    const handleCategorize = async () => {
        setIsCategorizing(true);
        try {
            const category = await categorizeFile(fileName, fileContent);
            setSuggestedCategory(category);
        } catch (error) {
            console.error('Categorization error:', error);
            setSuggestedCategory('Other');
        } finally {
            setIsCategorizing(false);
        }
    };

    const handleUseCategory = () => {
        onCategoryGenerated(suggestedCategory);
    };

    return (
        <div style={{ marginTop: 10 }}>
            <button
                onClick={handleCategorize}
                disabled={isCategorizing}
                style={{
                    background: '#17a2b8',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    cursor: isCategorizing ? 'not-allowed' : 'pointer',
                    fontSize: '14px'
                }}
            >
                {isCategorizing ? '🤖 AI Categorizing...' : '🤖 Categorize with AI'}
            </button>

            {suggestedCategory && (
                <div style={{ marginTop: 10 }}>
                    <div style={{
                        background: '#e7f3ff',
                        border: '1px solid #b3d9ff',
                        borderRadius: '6px',
                        padding: '8px 12px',
                        display: 'inline-block',
                        marginRight: 8
                    }}>
                        <span style={{ fontSize: '13px', color: '#0066cc' }}>
                            Suggested: {suggestedCategory}
                        </span>
                    </div>
                    <button
                        onClick={handleUseCategory}
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
                        Use This Category
                    </button>
                </div>
            )}
        </div>
    );
};

export default AiFileCategorizer; 