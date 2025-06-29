import React, { useState } from 'react';
import { testOllamaConnection } from '../../services/aiService';
import AiGroupNamer from './AiGroupNamer';
import AiFeedbackGenerator from './AiFeedbackGenerator';
import AiFileCategorizer from './AiFileCategorizer';

const AiTestPage = () => {
    const [isConnected, setIsConnected] = useState(null);
    const [testResults, setTestResults] = useState({});

    const testConnection = async () => {
        const connected = await testOllamaConnection();
        setIsConnected(connected);
        setTestResults(prev => ({ ...prev, connection: connected ? '✅ Connected' : '❌ Not Connected' }));
    };

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <h1>🤖 AI Features Test Page</h1>
            
            <div style={{ marginBottom: '30px', padding: '20px', background: '#f5f5f5', borderRadius: '8px' }}>
                <h3>Ollama Connection Test</h3>
                <button 
                    onClick={testConnection}
                    style={{
                        background: '#007bff',
                        color: 'white',
                        border: 'none',
                        padding: '10px 20px',
                        borderRadius: '6px',
                        cursor: 'pointer'
                    }}
                >
                    Test Connection
                </button>
                {isConnected !== null && (
                    <div style={{ marginTop: '10px', fontWeight: 'bold' }}>
                        Status: {isConnected ? '✅ Connected to Ollama' : '❌ Ollama not running'}
                    </div>
                )}
            </div>

            <div style={{ display: 'grid', gap: '20px' }}>
                
                <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
                    <h3>1. AI Group Namer Test</h3>
                    <AiGroupNamer 
                        projectName="Web Development Project"
                        projectDescription="Creating a modern e-commerce website with React and Node.js"
                        onNameGenerated={(name) => {
                            setTestResults(prev => ({ ...prev, groupName: name }));
                        }}
                    />
                    {testResults.groupName && (
                        <div style={{ marginTop: '10px', padding: '10px', background: '#e8f5e8', borderRadius: '4px' }}>
                            Generated: <strong>{testResults.groupName}</strong>
                        </div>
                    )}
                </div>

                <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
                    <h3>2. AI Feedback Generator Test</h3>
                    <AiFeedbackGenerator 
                        score={85}
                        projectName="Web Development Project"
                        onFeedbackGenerated={(feedback) => {
                            setTestResults(prev => ({ ...prev, feedback }));
                        }}
                    />
                    {testResults.feedback && (
                        <div style={{ marginTop: '10px', padding: '10px', background: '#e8f5e8', borderRadius: '4px' }}>
                            Generated: <strong>{testResults.feedback}</strong>
                        </div>
                    )}
                </div>

                <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
                    <h3>3. AI File Categorizer Test</h3>
                    <AiFileCategorizer 
                        fileName="project_report.pdf"
                        fileContent="This is a comprehensive project report containing analysis and conclusions..."
                        onCategoryGenerated={(category) => {
                            setTestResults(prev => ({ ...prev, category }));
                        }}
                    />
                    {testResults.category && (
                        <div style={{ marginTop: '10px', padding: '10px', background: '#e8f5e8', borderRadius: '4px' }}>
                            Generated: <strong>{testResults.category}</strong>
                        </div>
                    )}
                </div>
            </div>

            
            <div style={{ marginTop: '30px', padding: '20px', background: '#fff3cd', borderRadius: '8px' }}>
                <h3>📋 Instructions</h3>
                <p><strong>To use AI features:</strong></p>
                <ol>
                    <li>Make sure Ollama is installed and running on your system</li>
                    <li>Install a model: <code>ollama pull llama2</code></li>
                    <li>Test the connection above</li>
                    <li>Try each AI feature by clicking the buttons</li>
                </ol>
                <p><strong>Note:</strong> AI features require Ollama to be running on <code>http://localhost:11434</code></p>
            </div>
        </div>
    );
};

export default AiTestPage; 