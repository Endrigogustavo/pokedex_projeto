import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  Surface,
  Text,
  TextInput,
  Button,
  HelperText,
} from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Pokeball from '@/component/pokeball';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/useToast';

type Mode = 'login' | 'register';

export default function Index() {
  const [mode, setMode]         = useState<Mode>('login');
  const [usuario, setUsuario]   = useState('');
  const [senha, setSenha]       = useState('');
  const [showPass, setShowPass] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { signIn, register, isAuthenticated, isLoading } = useAuth();
  const { showToast } = useToast();

  // Já autenticado → vai direto pro app
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isLoading, isAuthenticated]);

  const isRegister = mode === 'register';
  const canSubmit  = usuario.trim().length >= 3 && senha.trim().length >= 6;

  const handleSubmit = async () => {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    try {
      if (isRegister) {
        await register(usuario.trim(), senha.trim());
        showToast('Conta criada com sucesso!', 'success');
        // login automático após o cadastro
        await signIn(usuario.trim(), senha.trim());
        router.replace('/dashboard');
      } else {
        const ok = await signIn(usuario.trim(), senha.trim());
        if (ok) {
          router.replace('/dashboard');
        } else {
          showToast('Não foi possível entrar', 'error');
        }
      }
    } catch (e: any) {
      showToast(e?.message || 'Algo deu errado', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.root}>
      {/* Pokébolas decorativas fixas ao fundo (cobrem a tela toda) */}
      <Pokeball size={360} style={styles.bgTop}    />
      <Pokeball size={220} style={styles.bgBottom} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={[
            styles.scroll,
            { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
        <View style={styles.hero}>
          <Pokeball size={88} />
          <Text variant="displaySmall" style={styles.heroTitle}>
            PokeFight
          </Text>
          <Text variant="bodyLarge" style={styles.heroSub}>
            Explore o mundo Pokémon
          </Text>
        </View>

        <Surface style={styles.card} elevation={3}>
          <Text variant="headlineSmall" style={styles.cardTitle}>
            {isRegister ? 'Criar conta' : 'Entrar'}
          </Text>
          <Text variant="bodySmall" style={styles.cardSub}>
            {isRegister
              ? 'Cadastre-se para salvar seu time na nuvem'
              : 'Acesse sua conta de treinador'}
          </Text>

          <TextInput
            mode="outlined"
            label="Usuário"
            value={usuario}
            onChangeText={setUsuario}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="next"
            left={<TextInput.Icon icon="account-outline" />}
            style={styles.input}
          />

          <TextInput
            mode="outlined"
            label="Senha"
            value={senha}
            onChangeText={setSenha}
            secureTextEntry={!showPass}
            autoCapitalize="none"
            returnKeyType="done"
            onSubmitEditing={handleSubmit}
            left={<TextInput.Icon icon="lock-outline" />}
            right={
              <TextInput.Icon
                icon={showPass ? 'eye-off-outline' : 'eye-outline'}
                onPress={() => setShowPass((v) => !v)}
              />
            }
            style={styles.input}
          />

          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={submitting}
            disabled={!canSubmit || submitting}
            style={styles.btn}
            contentStyle={styles.btnContent}
            labelStyle={styles.btnLabel}
          >
            {isRegister ? 'Cadastrar' : 'Entrar'}
          </Button>

          <View style={styles.switchRow}>
            <Text variant="bodySmall" style={styles.switchText}>
              {isRegister ? 'Já tem uma conta?' : 'Ainda não tem conta?'}
            </Text>
            <Button
              mode="text"
              compact
              onPress={() => setMode(isRegister ? 'login' : 'register')}
              labelStyle={styles.switchLink}
            >
              {isRegister ? 'Entrar' : 'Criar conta'}
            </Button>
          </View>

          <HelperText type="info" style={styles.hint} visible>
            Usuário com 3+ e senha com 6+ caracteres
          </HelperText>
        </Surface>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#CC0000',
    overflow: 'hidden',
  },
  flex: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  bgTop: {
    position: 'absolute',
    top: -120,
    right: -110,
    opacity: 0.13,
  },
  bgBottom: {
    position: 'absolute',
    bottom: -70,
    left: -70,
    opacity: 0.10,
  },
  hero: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 8,
  },
  heroTitle: {
    color: '#fff',
    fontWeight: '900',
    letterSpacing: 1.5,
    marginTop: 16,
  },
  heroSub: {
    color: 'rgba(255,255,255,0.82)',
    marginTop: 4,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#fff',
    borderRadius: 28,
    padding: 28,
  },
  cardTitle: {
    fontWeight: '800',
    color: '#1B1B1F',
  },
  cardSub: {
    color: '#6B7280',
    marginTop: 2,
    marginBottom: 22,
  },
  input: {
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  btn: {
    marginTop: 4,
    borderRadius: 16,
    backgroundColor: '#CC0000',
  },
  btnContent: {
    height: 52,
  },
  btnLabel: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  switchText: {
    color: '#6B7280',
  },
  switchLink: {
    fontWeight: '800',
    color: '#CC0000',
  },
  hint: {
    textAlign: 'center',
    marginTop: 2,
  },
});
