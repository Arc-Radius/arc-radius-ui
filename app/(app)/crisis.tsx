import {
  Linking,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  AlertCircle,
  BookOpen,
  Globe,
  Heart,
  Info,
  MessageSquare,
  PhoneCall,
  Scale,
  Shield,
  Stethoscope,
  Users,
} from 'lucide-react-native';

import { DEFAULT_STATE } from '@/components/shell/navigation/tab-config';

// ── Reusable pieces ──────────────────────────────

function CrisisAction({
  label,
  onPress,
  icon,
  style,
}: {
  label: string;
  onPress: () => void;
  icon: React.ReactNode;
  style?: { backgroundColor: string; color: string };
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-1.5 rounded-lg px-3 py-1.5 active:opacity-85"
      style={{ backgroundColor: style?.backgroundColor ?? '#f3f4f6' }}>
      {icon}
      <Text
        className="font-sans-medium text-[13px]"
        style={{ color: style?.color ?? '#374151' }}
        numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

function ResourceCard({
  iconBg,
  icon,
  title,
  subtitle,
  children,
  footerText,
}: {
  iconBg: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  children?: React.ReactNode;
  footerText?: string;
}) {
  const { width } = useWindowDimensions();
  const isWide = width >= 768;

  return (
    <View className="overflow-hidden rounded-xl border border-gray-200 bg-white p-4">
      <View className="flex-row items-start gap-3">
        <View className="rounded-lg p-2" style={{ backgroundColor: iconBg }}>
          {icon}
        </View>
        <View className="flex-1">
          <Text className="font-sans-semibold text-[14px] text-gray-800">{title}</Text>
          <Text className="mt-0.5 font-sans text-[13px] text-gray-500">{subtitle}</Text>
          {children ? (
            <View
              className="mt-3"
              style={
                isWide
                  ? { flexDirection: 'row', flexWrap: 'wrap', gap: 6 }
                  : { alignSelf: 'flex-start', gap: 6 }
              }>
              {children}
            </View>
          ) : null}
        </View>
      </View>
      {footerText ? (
        <View className="mt-3 border-t border-gray-100 pt-3">
          <Text className="font-sans text-[12px] leading-5 text-gray-500">{footerText}</Text>
        </View>
      ) : null}
    </View>
  );
}

function CompactCrisisCard({
  iconBg,
  icon,
  title,
  subtitle,
  actionLabel,
  actionBg,
  actionIcon,
  onAction,
}: {
  iconBg: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  actionLabel: string;
  actionBg: string;
  actionIcon: React.ReactNode;
  onAction: () => void;
}) {
  return (
    <View className="overflow-hidden rounded-xl border border-gray-200 bg-white p-4">
      <View className="flex-row items-start gap-3">
        <View className="rounded-lg p-2" style={{ backgroundColor: iconBg }}>
          {icon}
        </View>
        <View className="flex-1">
          <Text className="font-sans-semibold text-[14px] text-gray-800">{title}</Text>
          <Text className="mt-0.5 font-sans text-[13px] text-gray-500">{subtitle}</Text>
          <View className="mt-2" style={{ alignSelf: 'flex-start' }}>
            <CrisisAction
              label={actionLabel}
              onPress={onAction}
              icon={actionIcon}
              style={{ backgroundColor: actionBg, color: '#ffffff' }}
            />
          </View>
        </View>
      </View>
    </View>
  );
}

function LegalOrgCard({
  name,
  desc,
  focus,
  url,
  phone,
}: {
  name: string;
  desc: string;
  focus: string;
  url: string;
  phone?: string;
}) {
  return (
    <View
      className="mb-2 rounded-lg border bg-white p-3"
      style={{ borderColor: 'rgba(59,130,246,0.1)' }}>
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1">
          <Text className="font-sans-semibold text-[14px] text-zinc-800">{name}</Text>
          <Text className="mt-0.5 font-sans text-[12px] text-zinc-500">{desc}</Text>
          <Text className="mt-2 font-sans-semibold text-[12px]" style={{ color: '#2563eb' }}>
            {focus}
          </Text>
        </View>
        <View className="gap-1">
          <Pressable
            onPress={() => Linking.openURL(url)}
            className="flex-row items-center gap-1 rounded px-2 py-1"
            style={{ backgroundColor: 'rgba(59,130,246,0.1)' }}>
            <Text className="font-sans-semibold text-[12px]" style={{ color: '#1d4ed8' }}>
              Website
            </Text>
          </Pressable>
          {phone ? (
            <Pressable
              onPress={() => Linking.openURL(`tel:${phone}`)}
              className="flex-row items-center gap-1 rounded px-2 py-1"
              style={{ backgroundColor: 'rgba(34,197,94,0.1)' }}>
              <PhoneCall size={12} color="#15803d" />
              <Text className="font-sans-semibold text-[12px]" style={{ color: '#15803d' }}>
                Call
              </Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </View>
  );
}

// ── Main ─────────────────────────────────────────

export default function CrisisRoute() {
  const { width } = useWindowDimensions();
  const isWide = width >= 768;

  return (
    <SafeAreaView className="flex-1 bg-app-bg" edges={[]}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: Platform.OS === 'web' ? 32 : 12,
          paddingBottom: 40,
        }}>
        <View className="w-full max-w-[880px] gap-5 self-center">
          {/* ── Header ── */}
          <View>
            <Text className="font-sans-bold text-2xl text-zinc-900">Talk to someone</Text>
            <Text className="mt-1 font-sans text-base leading-7 text-zinc-600">
              Immediate help when you need it. All services are free and confidential.
            </Text>
          </View>

          {/* ── Emergency Banner ── */}
          <View
            className="rounded-xl border p-4"
            style={{
              backgroundColor: 'rgba(239,68,68,0.06)',
              borderColor: 'rgba(239,68,68,0.2)',
            }}>
            <View className="flex-row items-center gap-3">
              <View
                className="rounded-full p-2"
                style={{ backgroundColor: 'rgba(239,68,68,0.15)' }}>
                <AlertCircle size={24} color="#dc2626" />
              </View>
              <View className="flex-1">
                <Text className="font-sans-semibold text-[14px]" style={{ color: '#991b1b' }}>
                  If you&apos;re in immediate danger, call 911
                </Text>
                <Text className="mt-0.5 font-sans text-[13px]" style={{ color: '#dc2626' }}>
                  For life-threatening emergencies, always call emergency services first.
                </Text>
              </View>
            </View>
          </View>

          {/* ── LGBTQ+ Crisis Support ── */}
          <View className="gap-3">
            <View className="flex-row items-center gap-2">
              <Heart size={16} color="#ec4899" />
              <Text className="font-sans-semibold text-[14px] text-zinc-600">
                LGBTQ+ Crisis Support
              </Text>
            </View>

            <View style={{ gap: 8 }}>
              <ResourceCard
                iconBg="rgba(253,186,116,0.35)"
                icon={<Heart size={20} color="#f97316" />}
                title="The Trevor Project"
                subtitle="24/7 crisis support for LGBTQ+ youth under 25"
                footerText="Trained counselors available 24/7. TrevorChat and TrevorText also available. Specializes in LGBTQ+ youth crisis intervention.">
                <CrisisAction
                  label="1-866-488-7386"
                  onPress={() => Linking.openURL('tel:1-866-488-7386')}
                  icon={<PhoneCall size={14} color="#ffffff" />}
                  style={{ backgroundColor: '#f97316', color: '#ffffff' }}
                />
                <CrisisAction
                  label="Text START to 678-678"
                  onPress={() => Linking.openURL('sms:678678?body=START')}
                  icon={<MessageSquare size={14} color="#374151" />}
                />
                <CrisisAction
                  label="Online Chat"
                  onPress={() => Linking.openURL('https://www.thetrevorproject.org/get-help/')}
                  icon={<Globe size={14} color="#374151" />}
                />
              </ResourceCard>

              <ResourceCard
                iconBg="rgba(59,130,246,0.2)"
                icon={<Users size={20} color="#3b82f6" />}
                title="Trans Lifeline"
                subtitle="Peer support hotline run by and for trans people"
                footerText="All operators are trans-identified. Will never contact authorities without permission. Also offers microgrants for trans people in crisis.">
                <CrisisAction
                  label="1-877-565-8860"
                  onPress={() => Linking.openURL('tel:1-877-565-8860')}
                  icon={<PhoneCall size={14} color="#ffffff" />}
                  style={{ backgroundColor: '#3b82f6', color: '#ffffff' }}
                />
                <CrisisAction
                  label="translifeline.org"
                  onPress={() => Linking.openURL('https://translifeline.org')}
                  icon={<Globe size={14} color="#374151" />}
                />
              </ResourceCard>

              <ResourceCard
                iconBg="rgba(168,85,247,0.2)"
                icon={<PhoneCall size={20} color="#a855f7" />}
                title="LGBT National Hotline"
                subtitle="Peer support for LGBTQ+ people of all ages"
                footerText="Available Mon-Fri 4pm-12am ET, Sat 12pm-5pm ET. Volunteer-staffed by LGBTQ+ individuals. Also has a dedicated youth talkline.">
                <CrisisAction
                  label="1-888-843-4564"
                  onPress={() => Linking.openURL('tel:1-888-843-4564')}
                  icon={<PhoneCall size={14} color="#ffffff" />}
                  style={{ backgroundColor: '#a855f7', color: '#ffffff' }}
                />
                <CrisisAction
                  label="Online Chat"
                  onPress={() => Linking.openURL('https://lgbthotline.org')}
                  icon={<Globe size={14} color="#374151" />}
                />
              </ResourceCard>
            </View>
          </View>

          {/* ── General Crisis Support ── */}
          <View className="gap-3">
            <View className="flex-row items-center gap-2">
              <Shield size={16} color="#22c55e" />
              <Text className="font-sans-semibold text-[14px] text-zinc-600">
                General Crisis Support
              </Text>
            </View>

            {isWide ? (
              <View className="gap-2">
                <View className="flex-row gap-2">
                  <View className="flex-1">
                    <CompactCrisisCard
                      iconBg="rgba(34,197,94,0.2)"
                      icon={<PhoneCall size={18} color="#16a34a" />}
                      title="988 Suicide & Crisis Lifeline"
                      subtitle="24/7 support for anyone in crisis"
                      actionLabel="Call or Text 988"
                      actionBg="#22c55e"
                      actionIcon={<PhoneCall size={14} color="#ffffff" />}
                      onAction={() => Linking.openURL('tel:988')}
                    />
                  </View>
                  <View className="flex-1">
                    <CompactCrisisCard
                      iconBg="rgba(20,184,166,0.2)"
                      icon={<MessageSquare size={18} color="#14b8a6" />}
                      title="Crisis Text Line"
                      subtitle="Free 24/7 text-based support"
                      actionLabel="Text HELLO to 741741"
                      actionBg="#14b8a6"
                      actionIcon={<MessageSquare size={14} color="#ffffff" />}
                      onAction={() => Linking.openURL('sms:741741?body=HELLO')}
                    />
                  </View>
                </View>
                <View className="flex-row gap-2">
                  <View className="flex-1">
                    <CompactCrisisCard
                      iconBg="rgba(99,102,241,0.2)"
                      icon={<Stethoscope size={18} color="#4f46e5" />}
                      title="SAMHSA National Helpline"
                      subtitle="Substance abuse & mental health"
                      actionLabel="1-800-662-4357"
                      actionBg="#4f46e5"
                      actionIcon={<PhoneCall size={14} color="#ffffff" />}
                      onAction={() => Linking.openURL('tel:1-800-662-4357')}
                    />
                  </View>
                  <View className="flex-1">
                    <CompactCrisisCard
                      iconBg="rgba(244,63,94,0.2)"
                      icon={<Shield size={18} color="#e11d48" />}
                      title="National DV Hotline"
                      subtitle="Domestic violence support 24/7"
                      actionLabel="1-800-799-7233"
                      actionBg="#e11d48"
                      actionIcon={<PhoneCall size={14} color="#ffffff" />}
                      onAction={() => Linking.openURL('tel:1-800-799-7233')}
                    />
                  </View>
                </View>
              </View>
            ) : (
              <View className="gap-2">
                <CompactCrisisCard
                  iconBg="rgba(34,197,94,0.2)"
                  icon={<PhoneCall size={18} color="#16a34a" />}
                  title="988 Suicide & Crisis Lifeline"
                  subtitle="24/7 support for anyone in crisis"
                  actionLabel="Call or Text 988"
                  actionBg="#22c55e"
                  actionIcon={<PhoneCall size={14} color="#ffffff" />}
                  onAction={() => Linking.openURL('tel:988')}
                />
                <CompactCrisisCard
                  iconBg="rgba(20,184,166,0.2)"
                  icon={<MessageSquare size={18} color="#14b8a6" />}
                  title="Crisis Text Line"
                  subtitle="Free 24/7 text-based support"
                  actionLabel="Text HELLO to 741741"
                  actionBg="#14b8a6"
                  actionIcon={<MessageSquare size={14} color="#ffffff" />}
                  onAction={() => Linking.openURL('sms:741741?body=HELLO')}
                />
                <CompactCrisisCard
                  iconBg="rgba(99,102,241,0.2)"
                  icon={<Stethoscope size={18} color="#4f46e5" />}
                  title="SAMHSA National Helpline"
                  subtitle="Substance abuse & mental health"
                  actionLabel="1-800-662-4357"
                  actionBg="#4f46e5"
                  actionIcon={<PhoneCall size={14} color="#ffffff" />}
                  onAction={() => Linking.openURL('tel:1-800-662-4357')}
                />
                <CompactCrisisCard
                  iconBg="rgba(244,63,94,0.2)"
                  icon={<Shield size={18} color="#e11d48" />}
                  title="National DV Hotline"
                  subtitle="Domestic violence support 24/7"
                  actionLabel="1-800-799-7233"
                  actionBg="#e11d48"
                  actionIcon={<PhoneCall size={14} color="#ffffff" />}
                  onAction={() => Linking.openURL('tel:1-800-799-7233')}
                />
              </View>
            )}
          </View>

          {/* ── Free Legal Resources ── */}
          <View
            className="rounded-xl border p-4"
            style={{
              backgroundColor: 'rgba(59,130,246,0.04)',
              borderColor: 'rgba(59,130,246,0.15)',
            }}>
            <View className="mb-3 flex-row items-center gap-2">
              <Scale size={16} color="#1e40af" />
              <Text className="font-sans-semibold text-[14px]" style={{ color: '#1e40af' }}>
                Free Legal Resources
              </Text>
            </View>
            <LegalOrgCard
              name="Lambda Legal"
              desc="LGBTQ+ legal defense & advocacy"
              focus="All LGBTQ+ legal issues"
              url="https://lambdalegal.org/helpdesk"
              phone="1-866-542-8336"
            />
            <LegalOrgCard
              name="Transgender Law Center"
              desc="Trans-specific legal support"
              focus="Healthcare, ID documents, discrimination"
              url="https://transgenderlawcenter.org/legalinfo"
              phone="1-415-865-0176"
            />
            <LegalOrgCard
              name="ACLU"
              desc="State-specific civil liberties"
              focus="Know your rights, legal intake"
              url={`https://aclu.org/affiliates?state=${DEFAULT_STATE}`}
            />
            <LegalOrgCard
              name="GLBTQ Legal Advocates (GLAD)"
              desc="New England & national impact"
              focus="Legal info line, court cases"
              url="https://glad.org/know-your-rights"
              phone="1-800-455-4523"
            />
          </View>

          {/* ── Additional Resources ── */}
          <View className="rounded-xl border border-amber-100 bg-amber-50 p-4">
            <View className="mb-3 flex-row items-center gap-2">
              <BookOpen size={16} color="#f59e0b" />
              <Text className="font-sans-semibold text-[14px]" style={{ color: '#92400e' }}>
                Additional Resources
              </Text>
            </View>

            {isWide ? (
              <View className="flex-row gap-6">
                <View className="flex-1">
                  <Text className="font-sans-medium text-[13px]" style={{ color: '#b45309' }}>
                    Youth-Specific
                  </Text>
                  <View className="mt-2 gap-1.5">
                    {[
                      'Teen Line: (800) 852-8336',
                      'National Runaway Safeline: 1-800-786-2929',
                      'Childhelp: 1-800-422-4453',
                    ].map((t) => (
                      <View key={t} className="flex-row items-center gap-2">
                        <View
                          className="h-[4px] w-[4px] rounded-full"
                          style={{ backgroundColor: '#fbbf24' }}
                        />
                        <Text className="font-sans text-[12px]" style={{ color: '#b45309' }}>
                          {t}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
                <View className="flex-1">
                  <Text className="font-sans-medium text-[13px]" style={{ color: '#b45309' }}>
                    Specialized Support
                  </Text>
                  <View className="mt-2 gap-1.5">
                    {[
                      'RAINN (Sexual Assault): 1-800-656-4673',
                      'NEDA (Eating Disorders): 1-800-931-2237',
                      'Veterans Crisis: 988, press 1',
                    ].map((t) => (
                      <View key={t} className="flex-row items-center gap-2">
                        <View
                          className="h-[4px] w-[4px] rounded-full"
                          style={{ backgroundColor: '#fbbf24' }}
                        />
                        <Text className="font-sans text-[12px]" style={{ color: '#b45309' }}>
                          {t}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            ) : (
              <View className="gap-4">
                <View>
                  <Text className="font-sans-medium text-[13px]" style={{ color: '#b45309' }}>
                    Youth-Specific
                  </Text>
                  <View className="mt-2 gap-1.5">
                    {[
                      'Teen Line: (800) 852-8336',
                      'National Runaway Safeline: 1-800-786-2929',
                      'Childhelp: 1-800-422-4453',
                    ].map((t) => (
                      <View key={t} className="flex-row items-center gap-2">
                        <View
                          className="h-[4px] w-[4px] rounded-full"
                          style={{ backgroundColor: '#fbbf24' }}
                        />
                        <Text className="font-sans text-[12px]" style={{ color: '#b45309' }}>
                          {t}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
                <View>
                  <Text className="font-sans-medium text-[13px]" style={{ color: '#b45309' }}>
                    Specialized Support
                  </Text>
                  <View className="mt-2 gap-1.5">
                    {[
                      'RAINN (Sexual Assault): 1-800-656-4673',
                      'NEDA (Eating Disorders): 1-800-931-2237',
                      'Veterans Crisis: 988, press 1',
                    ].map((t) => (
                      <View key={t} className="flex-row items-center gap-2">
                        <View
                          className="h-[4px] w-[4px] rounded-full"
                          style={{ backgroundColor: '#fbbf24' }}
                        />
                        <Text className="font-sans text-[12px]" style={{ color: '#b45309' }}>
                          {t}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            )}
          </View>

          {/* ── Safety Note ── */}
          <View className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <View className="flex-row items-start gap-3">
              <Info size={18} color="#9ca3af" style={{ marginTop: 2 }} />
              <View className="flex-1">
                <Text className="font-sans-semibold text-[14px]" style={{ color: '#374151' }}>
                  Your privacy matters
                </Text>
                <Text className="mt-2 font-sans text-[13px] leading-6" style={{ color: '#4b5563' }}>
                  All crisis lines are confidential. Most will not contact authorities unless there
                  is immediate danger to life. Trans Lifeline specifically will never contact
                  authorities without your consent. If you&apos;re concerned about phone records,
                  consider using text or online chat options.
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
