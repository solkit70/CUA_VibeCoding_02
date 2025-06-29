import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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

// 실제 OpenAI GPT-4.1 API 호출 함수 (fetch 사용 예시)
async function callOpenAI(messages: any[]): Promise<string> {
  const apiKey = localStorage.getItem('tmp::voice_api_key') || '';
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o', // 또는 'gpt-4.1' 등 실제 사용 모델명
      messages,
      temperature: 0.7,
    }),
  });
  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

const EnglishCoachPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const [conversation, setConversation] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [turn, setTurn] = useState(0);
  const [koreanFeedback, setKoreanFeedback] = useState<string | null>(null);
  const [englishEval, setEnglishEval] = useState<string | null>(null);
  const [koreanEval, setKoreanEval] = useState<string | null>(null);
  const { isRecording, transcript, setTranscript, startRecording, stopRecording } = useSpeech();
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string>('');

  const scenario: ConversationScenario | undefined = conversationScenarios.find(s => s.id === selectedScenario);

  // 음성 목록 로드
  useEffect(() => {
    const loadVoices = () => {
      const voicesList = window.speechSynthesis.getVoices();
      setVoices(voicesList.filter(v => v.lang === 'en-US'));
      // 기본값: 여성 우선, 없으면 첫 번째 en-US
      const female = voicesList.find(v => v.lang === 'en-US' && (v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('woman') || v.name.toLowerCase().includes('samantha')));
      setSelectedVoiceURI(female?.voiceURI || voicesList.find(v => v.lang === 'en-US')?.voiceURI || '');
    };
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
    loadVoices();
  }, []);

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

  // 시나리오 선택 시: AI에게 system prompt로 전달, 첫 질문 생성
  useEffect(() => {
    const startConversation = async () => {
      if (scenario) {
        setIsLoading(true);
        setConversation([]);
        setTurn(0);
        setKoreanFeedback(null);
        setError(null);
        setTranscript('');
        setEnglishEval(null);
        setKoreanEval(null);
        try {
          const messages = [
            { role: 'system', content: scenario.initialPrompt }
          ];
          const aiFirstQ = await callOpenAI(messages);
          setConversation([{ role: 'assistant', text: aiFirstQ }]);
          speak(aiFirstQ);
        } catch (e) {
          setError('AI 첫 질문 생성 실패');
        } finally {
          setIsLoading(false);
        }
      }
    };
    if (scenario) startConversation();
    // eslint-disable-next-line
  }, [scenario]);

  // 사용자 답변 → AI 호출
  const handleSend = async () => {
    if (!transcript.trim() || !scenario || turn >= 5) return;
    setIsLoading(true);
    setError(null);
    try {
      // 1. User 메시지를 먼저 대화에 추가 (User: prefix)
      const userMsgObj = { role: 'user', text: `User: ${transcript}` };
      const newConversation = [...conversation, userMsgObj];
      setConversation(newConversation);
      // 2. AI 호출을 위한 메시지 변환
      const prevMsgs = newConversation
        .filter((msg: any) => msg.role === 'assistant' || msg.role === 'user')
        .map((msg: any) => ({
          role: msg.role,
          content: msg.text.replace(/^User: |^AI: /, ''), // prefix 제거 후 전달
        }));
      const messages = [
        { role: 'system', content: scenario.initialPrompt },
        ...prevMsgs
      ];
      let aiText = '';
      if (turn < 4) {
        aiText = await callOpenAI([...messages, { role: 'user', content: transcript }]);
        const aiMsgObj = { role: 'assistant', text: `AI: ${aiText}` };
        setConversation([...newConversation, aiMsgObj]);
        speak(aiText);
        setTurn(turn + 1);
        setTranscript('');
      } else {
        // 5턴 후 평가
        const evalPrompt = `You are an English teacher. Based on the following conversation, evaluate the user's English speaking skills (pronunciation, grammar, vocabulary, fluency) in English. Be honest but encouraging.\n\nConversation:\n${messages.map(m=>m.role+': '+m.content).join('\n')}`;
        const evalMsg = [
          { role: 'system', content: evalPrompt }
        ];
        const englishFeedback = await callOpenAI(evalMsg);
        setEnglishEval(englishFeedback);
        // 한국어 번역
        const translatePrompt = `Translate the following English feedback into Korean:\n${englishFeedback}`;
        const koreanMsg = [
          { role: 'system', content: translatePrompt }
        ];
        const koreanFeedback = await callOpenAI(koreanMsg);
        setKoreanEval(koreanFeedback);
        setTurn(turn + 1);
        setTranscript('');
      }
    } catch (e) {
      setError('AI 응답 오류');
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

  function speak(text: string) {
    if ('speechSynthesis' in window) {
      const utter = new window.SpeechSynthesisUtterance(text);
      utter.lang = 'en-US';
      const voice = voices.find(v => v.voiceURI === selectedVoiceURI);
      if (voice) utter.voice = voice;
      window.speechSynthesis.speak(utter);
    }
  }

  return (
    <div className="english-coach-page">
      <div className="content-top">
        <button className="home-btn" onClick={() => navigate('/')}>Home</button>
        <div className="voice-select">
          <label htmlFor="voice-dropdown">Voice: </label>
          <select
            id="voice-dropdown"
            value={selectedVoiceURI}
            onChange={e => setSelectedVoiceURI(e.target.value)}
          >
            {voices.map(v => (
              <option key={v.voiceURI} value={v.voiceURI}>
                {v.name} {v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('woman') || v.name.toLowerCase().includes('samantha') ? '(Female)' : '(Male)'}
              </option>
            ))}
          </select>
        </div>
      </div>
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
          {englishEval && <div className="english-eval">{englishEval}</div>}
          {koreanEval && <div className="korean-eval">{koreanEval}</div>}
          {koreanFeedback && <div className="korean-feedback">{koreanFeedback}</div>}
          {error && <div className="error">{error}</div>}
          <div className="input-section">
            <button onClick={isRecording ? stopRecording : startRecording} disabled={isLoading || turn >= 5}>
              {isRecording ? 'Stop Recording' : 'Start Recording'}
            </button>
            <input
              type="text"
              value={transcript}
              onChange={e => setTranscript(e.target.value)}
              placeholder="Speak or type your answer..."
              disabled={isLoading || turn >= 5}
              style={{ width: '70%', marginLeft: 8 }}
            />
            <button onClick={handleSend} disabled={isLoading || !transcript.trim() || turn >= 5}>
              Send
            </button>
          </div>
          <div className="progress-info">Turn: {Math.min(turn + 1, 5)} / 5</div>
        </div>
      )}
    </div>
  );
};

export default EnglishCoachPage;
