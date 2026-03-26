import { useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Send,
  HelpCircle,
  Database,
  GitFork,
  Loader2,
  MessageCircleMore,
} from 'lucide-react-native';

// ── Mock data ────────────────────────────────────
const SUGGESTED_QUESTIONS = [
  'What bills affect transgender youth healthcare in Texas?',
  'Compare California and Florida LGBTQ+ protections',
  'Which states have anti-discrimination employment laws?',
];

interface Message {
  id: number;
  role: 'user' | 'assistant';
  text: string;
  sources?: { label: string; type: 'bill' | 'entity' | 'relationship' }[];
}

const MOCK_RESPONSES: Record<string, Message> = {
  'What bills affect transgender youth healthcare in Texas?': {
    id: 0,
    role: 'assistant',
    text: 'Based on our knowledge graph, Texas currently has 3 active bills affecting transgender youth healthcare:\n\n• SB 14 — Restricts gender-affirming care for minors (Classified: Harmful, Confidence: 92%)\n• HB 1686 — Criminalizes providing puberty blockers to minors (Classified: Harmful, Confidence: 88%)\n• SB 1029 — Requires parental consent for mental health referrals (Classified: Harmful, Confidence: 76%)\n\nAll three bills were identified through entity extraction from legislative text and cross-referenced with healthcare policy nodes in the graph.',
    sources: [
      { label: 'SB 14', type: 'bill' },
      { label: 'HB 1686', type: 'bill' },
      { label: 'transgender youth', type: 'entity' },
      { label: 'healthcare access → minors', type: 'relationship' },
    ],
  },
  'Compare California and Florida LGBTQ+ protections': {
    id: 0,
    role: 'assistant',
    text: 'Graph traversal across state policy nodes reveals significant divergence:\n\nCalifornia (Supportive)\n• 12 active protective bills\n• Employment, housing, and healthcare anti-discrimination\n• Gender-affirming care access protected\n\nFlorida (Harmful)\n• 8 active restrictive bills\n• "Don\'t Say Gay" education restrictions\n• Gender-affirming care bans for minors\n• Bathroom usage restrictions\n\nThe knowledge graph identifies 4 shared policy domains where these states take opposing legislative approaches.',
    sources: [
      { label: 'California', type: 'entity' },
      { label: 'Florida', type: 'entity' },
      { label: 'opposes → policy domain', type: 'relationship' },
      { label: 'AB 1955', type: 'bill' },
    ],
  },
  'Which states have anti-discrimination employment laws?': {
    id: 0,
    role: 'assistant',
    text: 'Querying the knowledge graph for employment protection nodes:\n\n23 states + DC have comprehensive LGBTQ+ employment anti-discrimination laws. Key findings:\n\n• Full protection (sexual orientation + gender identity): CA, NY, WA, CO, IL, MA, and 17 others\n• Partial protection (sexual orientation only): WI, NH\n• No state-level protection: 25 states rely on federal Bostock v. Clayton County (2020)\n\nGraph analysis shows a strong correlation between states with employment protections and those with supportive healthcare legislation (r=0.82).',
    sources: [
      { label: 'employment protection', type: 'entity' },
      { label: 'Bostock v. Clayton County', type: 'entity' },
      { label: 'protects → employment', type: 'relationship' },
    ],
  },
};

// ── Source pill ───────────────────────────────────
function SourcePill({ label, type }: { label: string; type: 'bill' | 'entity' | 'relationship' }) {
  const colors = {
    bill: { bg: 'rgba(59,130,246,0.1)', text: '#1d4ed8', border: 'rgba(59,130,246,0.2)' },
    entity: { bg: 'rgba(147,51,234,0.1)', text: '#7c3aed', border: 'rgba(147,51,234,0.2)' },
    relationship: { bg: 'rgba(249,115,22,0.1)', text: '#c2410c', border: 'rgba(249,115,22,0.2)' },
  };
  const c = colors[type];

  return (
    <View
      className="flex-row items-center rounded-full px-2.5 py-1"
      style={{ backgroundColor: c.bg, borderWidth: 0.5, borderColor: c.border }}>
      {type === 'bill' && <Database size={10} color={c.text} style={{ marginRight: 4 }} />}
      {type === 'entity' && <HelpCircle size={10} color={c.text} style={{ marginRight: 4 }} />}
      {type === 'relationship' && <GitFork size={10} color={c.text} style={{ marginRight: 4 }} />}
      <Text className="font-sans text-[10px]" style={{ color: c.text }}>
        {label}
      </Text>
    </View>
  );
}

// ── Chat bubble ──────────────────────────────────
function ChatBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';

  return (
    <View className={`mb-3 ${isUser ? 'items-end' : 'items-start'}`}>
      <View
        className={`rounded-2xl px-4 py-3 ${isUser ? 'rounded-br-md' : 'rounded-bl-md'}`}
        style={{
          backgroundColor: isUser ? '#18181b' : '#ffffff',
          borderWidth: isUser ? 0 : 1,
          borderColor: isUser ? undefined : 'rgba(228,228,231,0.8)',
        }}>
        <Text
          className={`font-sans text-sm leading-relaxed ${isUser ? 'text-white' : 'text-zinc-800'}`}>
          {message.text}
        </Text>
      </View>
      {message.sources && message.sources.length > 0 && (
        <View className="mt-1.5 flex-row flex-wrap gap-1.5 px-1">
          {message.sources.map((s, i) => (
            <SourcePill key={i} label={s.label} type={s.type} />
          ))}
        </View>
      )}
    </View>
  );
}

// ── Typing indicator ─────────────────────────────
function TypingIndicator() {
  return (
    <View className="mb-3 items-start">
      <View className="flex-row items-center gap-2 rounded-2xl rounded-bl-md border border-zinc-200 bg-white px-4 py-3">
        <Loader2 size={14} color="#71717a" />
        <Text className="font-sans text-sm text-zinc-400">Querying knowledge graph...</Text>
      </View>
    </View>
  );
}

// ── Main ─────────────────────────────────────────
export default function AskRoute() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const nextId = useRef(1);

  const sendMessage = (text: string) => {
    if (!text.trim() || isTyping) return;

    const userMsg: Message = { id: nextId.current++, role: 'user', text: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);

    // Simulate RAG response
    setTimeout(() => {
      const mock = MOCK_RESPONSES[text.trim()];
      const assistantMsg: Message = mock
        ? { ...mock, id: nextId.current++ }
        : {
            id: nextId.current++,
            role: 'assistant',
            text: `I searched the knowledge graph for "${text.trim()}" but this query isn't in the demo dataset yet. In production, this would traverse bill entities, policy relationships, and state nodes to generate a comprehensive answer.`,
            sources: [{ label: 'knowledge graph', type: 'entity' }],
          };
      setMessages((prev) => [...prev, assistantMsg]);
      setIsTyping(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }, 1500);
  };

  const isEmpty = messages.length === 0;

  return (
    <SafeAreaView className="flex-1 bg-app-bg" edges={[]}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
        <View className="flex-1">
          {/* Chat area */}
          <ScrollView
            ref={scrollRef}
            className="flex-1"
            contentContainerStyle={{
              paddingHorizontal: 24,
              paddingTop: Platform.OS === 'web' ? 32 : 12,
              paddingBottom: 16,
            }}>
            <View className="w-full max-w-[880px] self-center">
              {/* Header */}
              <View className="mb-5">
                <Text className="font-sans-bold text-2xl text-zinc-900">Ask anything</Text>
                <Text className="mt-1 font-sans text-base leading-7 text-zinc-600">
                  Powered by our Legislative Knowledge Graph.
                </Text>
              </View>
            </View>
            <View className="w-full max-w-[880px] self-center">
              {isEmpty && (
                <View className="gap-3 py-6">
                  <View className="gap-3 overflow-hidden rounded-xl border border-gray-200 bg-white p-4">
                    <View className="flex-row items-start gap-3">
                      <View
                        className="rounded-lg p-2"
                        style={{ backgroundColor: 'rgba(59,130,246,0.2)' }}>
                        <GitFork size={20} color="#3b82f6" />
                      </View>
                      <View className="flex-1">
                        <Text className="font-sans-semibold text-[14px] text-gray-800">
                          Knowledge Graph Reasoning
                        </Text>
                        <Text className="mt-0.5 font-sans text-[13px] text-gray-500">
                          Ask questions about LGBTQ+ bills, rights, and protections.
                        </Text>
                      </View>
                    </View>
                    <View style={{ gap: 6 }}>
                      {SUGGESTED_QUESTIONS.map((q, i) => (
                        <Pressable
                          key={i}
                          onPress={() => sendMessage(q)}
                          className="flex-row items-center gap-2.5 rounded-lg bg-gray-50 px-3 py-2.5 active:bg-gray-100">
                          <MessageCircleMore size={14} color="#3b82f6" />
                          <Text className="flex-1 font-sans text-[13px] text-gray-700">{q}</Text>
                        </Pressable>
                      ))}
                    </View>
                  </View>

                  {/* Graph info */}
                  <View
                    className="w-full flex-row items-start gap-2.5 rounded-xl p-3.5"
                    style={{
                      backgroundColor: 'rgba(59,130,246,0.05)',
                      borderWidth: 1,
                      borderColor: 'rgba(59,130,246,0.1)',
                    }}>
                    <Database size={14} color="#3b82f6" style={{ marginTop: 2 }} />
                    <View className="flex-1">
                      <Text className="font-sans-medium text-sm text-zinc-700">How it works</Text>
                      <Text className="mt-0.5 font-sans text-xs leading-5 text-zinc-600">
                        Your question is matched against bill entities and policy relationships in
                        our knowledge graph. Relevant subgraphs are retrieved and used as context
                        for answer generation.
                      </Text>
                    </View>
                  </View>
                </View>
              )}

              {messages.map((msg) => (
                <ChatBubble key={msg.id} message={msg} />
              ))}
              {isTyping && <TypingIndicator />}
            </View>
          </ScrollView>

          {/* Input bar */}
          <View
            className="border-t border-zinc-200/80 bg-app-bg pb-2 pt-2"
            style={{ paddingHorizontal: 24 }}>
            <View className="w-full max-w-[880px] flex-row items-end gap-2 self-center">
              <View className="flex-1 flex-row items-end rounded-xl border border-zinc-200 bg-white px-3 py-2">
                <TextInput
                  value={input}
                  onChangeText={setInput}
                  placeholder="Ask about bills, rights, protections..."
                  placeholderTextColor="#a1a1aa"
                  multiline
                  className="max-h-[100px] flex-1 font-sans text-sm text-zinc-800"
                  style={{ paddingTop: 4, paddingBottom: 4 }}
                  onSubmitEditing={() => sendMessage(input)}
                  returnKeyType="send"
                  blurOnSubmit
                />
              </View>
              <Pressable
                onPress={() => sendMessage(input)}
                disabled={!input.trim() || isTyping}
                className="h-10 w-10 items-center justify-center rounded-xl active:opacity-80"
                style={{
                  backgroundColor: input.trim() && !isTyping ? '#18181b' : '#e4e4e7',
                }}>
                <Send size={16} color={input.trim() && !isTyping ? '#ffffff' : '#a1a1aa'} />
              </Pressable>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
