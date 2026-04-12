import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Send,
  HelpCircle,
  Database,
  GitFork,
  Lightbulb,
  Loader2,
  MessageCircleMore,
} from 'lucide-react-native';
import Markdown from 'react-native-markdown-display';

import { apiClient } from '@/api/client';

const SUGGESTED_QUESTIONS = [
  'How do different states handle gender marker changes on official documents?',
  'Which states have religious exemption laws affecting LGBTQ+ rights?',
  'What curriculum bills restrict LGBTQ+ topics in California schools?',
  'What bills affect transgender youth healthcare access in Texas?',
  'Compare Florida and New York LGBTQ+ protections',
];

const TOPICS = [
  'healthcare',
  'education',
  'civil_rights',
  'sports',
  'curriculum_speech',
  'facilities',
  'religious_exemption',
  'identity_documents',
  'expression',
];

interface Source {
  label: string;
  type: 'bill' | 'entity' | 'relationship';
}

interface Message {
  id: number;
  role: 'user' | 'assistant';
  text: string;
  sources?: Source[];
}

function mapSources(
  sources: { bill_number?: string; state?: string; title?: string }[] | undefined
): Source[] {
  if (!sources || sources.length === 0) return [];
  const seen = new Set<string>();
  const pills: Source[] = [];
  for (const s of sources) {
    const key = [s.state, s.bill_number].filter(Boolean).join(' ');
    if (key && !seen.has(key)) {
      seen.add(key);
      pills.push({ label: key, type: 'bill' });
    }
  }
  return pills;
}

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

// ── Markdown styles ─────────────────────────────
const markdownStyles = {
  body: { fontSize: 14, lineHeight: 22, color: '#27272a', fontFamily: 'GreycliffCF_400Regular' },
  heading2: {
    fontSize: 15,
    fontFamily: 'GreycliffCF_700Bold',
    color: '#18181b',
    marginTop: 8,
    marginBottom: 4,
  },
  heading3: {
    fontSize: 14,
    fontFamily: 'GreycliffCF_600DemiBold',
    color: '#18181b',
    marginTop: 6,
    marginBottom: 2,
  },
  strong: { fontFamily: 'GreycliffCF_600DemiBold' },
  bullet_list: { marginTop: 4 },
  list_item: { marginBottom: 2 },
  paragraph: { marginTop: 2, marginBottom: 2 },
};

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
        {isUser ? (
          <Text className="font-sans text-sm leading-relaxed text-white">{message.text}</Text>
        ) : (
          <Markdown style={markdownStyles}>{message.text}</Markdown>
        )}
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

// ── Typing indicator (spinning + animated dots) ──
function TypingIndicator() {
  const spinAnim = useRef(new Animated.Value(0)).current;
  const [dots, setDots] = useState('');

  useEffect(() => {
    const spin = Animated.loop(
      Animated.timing(spinAnim, { toValue: 1, duration: 800, useNativeDriver: false })
    );
    spin.start();
    const dotsInterval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, 400);
    return () => { spin.stop(); clearInterval(dotsInterval); };
  }, [spinAnim]);

  const rotate = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View className="mb-3 items-start">
      <View className="flex-row items-center gap-2 rounded-2xl rounded-bl-md border border-zinc-200 bg-white px-4 py-3">
        <Animated.View style={{ transform: [{ rotate }] }}>
          <Loader2 size={14} color="#71717a" />
        </Animated.View>
        <Text className="font-sans text-sm text-zinc-400">
          Querying knowledge graph{dots}{'   '.slice(dots.length)}
        </Text>
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
  const insets = useSafeAreaInsets();

  const sendMessage = async (text: string) => {
    if (!text.trim() || isTyping) return;

    const userMsg: Message = { id: nextId.current++, role: 'user', text: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);

    try {
      const data = await apiClient.get<Record<string, unknown>>(
        `/bills/rag?query=${encodeURIComponent(text.trim())}&top=10`
      );

      const assistantMsg: Message = {
        id: nextId.current++,
        role: 'assistant',
        text: (data.answer as string) || 'No answer returned.',
        sources: mapSources(data.sources as any),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error('[ask] error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: nextId.current++,
          role: 'assistant',
          text: err instanceof Error && err.message.includes('timed out')
            ? 'The request timed out — our knowledge graph can take a moment on complex queries. Please try again.'
            : `Something went wrong: ${err instanceof Error ? err.message : 'Please try again.'}`,
        },
      ]);
    } finally {
      setIsTyping(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  const isEmpty = messages.length === 0;

  return (
    <SafeAreaView className="flex-1 bg-app-bg" edges={[]}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top + 44 : 0}>
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
                          <Text className={`flex-1 font-sans text-gray-700 ${Platform.OS === 'web' ? 'text-[13px]' : 'text-[12px]'}`}>{q}</Text>
                        </Pressable>
                      ))}
                    </View>
                  </View>

                  {/* Search tips */}
                  <View
                    className="w-full rounded-xl p-3.5"
                    style={{
                      backgroundColor: 'rgba(59,130,246,0.05)',
                      borderWidth: 1,
                      borderColor: 'rgba(59,130,246,0.1)',
                    }}>
                    <View className="flex-row items-start gap-2.5">
                      <Database size={14} color="#3b82f6" style={{ marginTop: 2 }} />
                      <View className="flex-1">
                        <Text className="font-sans-medium text-sm text-zinc-700">Search tips</Text>
                        <Text className="mt-0.5 font-sans text-xs leading-5 text-zinc-600">
                          For better results, try narrowing your search with a state, topic, year,
                          or status — e.g. "supportive healthcare bills that are active in Texas in
                          2025"
                        </Text>
                      </View>
                    </View>
                    <View className="mt-2.5 flex-row flex-wrap gap-1.5 pl-6">
                      {TOPICS.map((t) => (
                        <View
                          key={t}
                          className="rounded-full px-2 py-0.5"
                          style={{ backgroundColor: 'rgba(59,130,246,0.1)' }}>
                          <Text className="font-sans text-[10px]" style={{ color: '#3b82f6' }}>
                            {t.replace(/_/g, ' ')}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  {/* How it works */}
                  <View
                    className="w-full flex-row items-start gap-2.5 rounded-xl p-3.5"
                    style={{
                      backgroundColor: 'rgba(59,130,246,0.05)',
                      borderWidth: 1,
                      borderColor: 'rgba(59,130,246,0.1)',
                    }}>
                    <Lightbulb size={14} color="#3b82f6" style={{ marginTop: 2 }} />
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
                  selectionColor="#3b82f6"
                  multiline
                  className="max-h-[100px] flex-1 font-sans text-sm text-zinc-800"
                  style={{
                    paddingTop: 4,
                    paddingBottom: 4,
                    ...Platform.select({ web: { outlineStyle: 'none' } as any }),
                  }}
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
