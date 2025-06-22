import React, { useState, useEffect, useRef } from 'react';
import { ScenarioSelector } from '../components/ScenarioSelector';
import { ConversationScenario, conversationScenarios } from '../utils/conversation_scenarios';
import '../pages/EnglishCoachPage.scss';

// (Web Speech API 사용 예시, 실제 서비스 환경에서는 Whisper/TTS 서버 연동 필요)
const useSpeech = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<any>(null);

  const startRecording = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('SpeechRecognition not supported');
      return;
    }
    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.onresult = (event: any) => {
      setTranscript(event.results[0][0].transcript);
    };
    recognition.onend = () => setIsRecording(false);
    recognitionRef.current = recognition;
    setIsRecording(true);
    recognition.start();
  };
  const stopRecording = () => {
    recognitionRef.current?.stop();
    setIsRecording(false);
  };
  return { isRecording, transcript, setTranscript, startRecording, stopRecording };
};

const EnglishCoachPage: React.FC = () => {
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const [conversation, setConversation] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [turn, setTurn] = useState(0);
  const [koreanFeedback, setKoreanFeedback] = useState<string | null>(null);
  const { isRecording, transcript, setTranscript, startRecording, stopRecording } = useSpeech();

  const scenario: ConversationScenario | undefined = conversationScenarios.find(s => s.id === selectedScenario);

  // 대화 시작(시나리오 프롬프트)
  useEffect(() => {
    if (scenario) {
      setConversation([
        { role: 'system', text: scenario.initialPrompt }
      ]);
      setTurn(0);
      setKoreanFeedback(null);
      setError(null);
      setTranscript('');
    }
  }, [scenario, setTranscript]);

  // 사용자 발화 → GPT-4.1 호출 (여기선 구조만, 실제 API 연동 필요)
  const handleSend = async () => {
    if (!transcript.trim() || !scenario) return;
    setIsLoading(true);
    setError(null);
    try {
      // 실제 OpenAI API 호출 부분 (여기선 모킹)
      const userMsg = { role: 'user', text: transcript };
      const newConv = [...conversation, userMsg];
      // GPT-4.1 응답 모킹
      let aiText = '';
      if (turn < 4) {
        aiText = `AI: (시나리오 진행) [${scenario.title}]`;
      } else {
        aiText = `AI: (한글 피드백) 영어 실력에 대한 피드백입니다.`;
      }
      const aiMsg = { role: 'assistant', text: aiText };
      setConversation([...newConv, aiMsg]);
      setTurn(turn + 1);
      setTranscript('');
      if (turn === 4) setKoreanFeedback('영어 실력에 대한 피드백입니다. (실제 API 연동 필요)');
    } catch (e: any) {
      setError('대화 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleScenarioSelect = (scenarioId: string) => {
    setSelectedScenario(scenarioId);
    setConversation([]);
    setTurn(0);
    setKoreanFeedback(null);
    setError(null);
  };

  return (
    <div className="english-coach-page">
      <h1>English Conversation Coach</h1>
      {!selectedScenario ? (
        <div className="scenario-select-section">
          <h2>Select a Scenario</h2>
          <ScenarioSelector 
            scenarios={conversationScenarios}
            selectedScenarioId={selectedScenario}
            onSelect={handleScenarioSelect} 
          />
        </div>
      ) : (
        <div className="conversation-section">
          <button className="back-btn" onClick={() => setSelectedScenario(null)}>
            ← Change Scenario
          </button>
          <div className="conversation-list">
            {conversation.map((msg, idx) => (
              <div key={idx} className={`msg ${msg.role}`}>{msg.text}</div>
            ))}
          </div>
          {koreanFeedback && <div className="korean-feedback">{koreanFeedback}</div>}
          {error && <div className="error">{error}</div>}
          <div className="input-section">
            <button onClick={isRecording ? stopRecording : startRecording} disabled={isLoading}>
              {isRecording ? 'Stop Recording' : 'Start Recording'}
            </button>
            <input
              type="text"
              value={transcript}
              onChange={e => setTranscript(e.target.value)}
              placeholder="Speak or type your answer..."
              disabled={isLoading}
              style={{ width: '70%', marginLeft: 8 }}
            />
            <button onClick={handleSend} disabled={isLoading || !transcript.trim() || turn >= 5}>
              Send
            </button>
          </div>
          <div className="progress-info">Turn: {turn + 1} / 5</div>
        </div>
      )}
    </div>
  );
};

export default EnglishCoachPage;
