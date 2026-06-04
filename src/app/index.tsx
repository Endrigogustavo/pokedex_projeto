import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import {
  Surface,
  Text,
  TextInput,
  Button,
  HelperText,
  Snackbar,
} from 'react-native-paper';

import Pokeball from '@/component/pokeball';

export default function Index() {
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState(false);

  const router = useRouter();

  const handleLogin = () => {
    if (
      usuario.trim().toLowerCase() === 'ash' &&
      senha.trim() === 'pikachu'
    ) {
      router.push('/dashboard');
    } else {
      setError(true);
    }
  };

  return (
    <View style={styles.container}>
      <Pokeball size={320} style={styles.bgBallTop} />
      <Pokeball size={240} style={styles.bgBallBottom} />

      <View style={styles.content}>
        <Pokeball size={96} style={styles.logo} />
        <Text variant="displaySmall" style={styles.title}>
          Pokédex
        </Text>
        <Text variant="titleMedium" style={styles.subtitle}>
          Acesse sua conta de treinador
        </Text>

        <Surface style={styles.card} elevation={5}>
          <Text variant="titleLarge" style={styles.cardTitle}>
            Entrar
          </Text>

          <TextInput
            mode="outlined"
            label="Treinador"
            value={usuario}
            onChangeText={setUsuario}
            autoCapitalize="none"
            left={<TextInput.Icon icon="account" />}
            style={styles.input}
          />

          <TextInput
            mode="outlined"
            label="Senha"
            value={senha}
            onChangeText={setSenha}
            secureTextEntry={!showPass}
            autoCapitalize="none"
            left={<TextInput.Icon icon="lock" />}
            right={
              <TextInput.Icon
                icon={showPass ? 'eye-off' : 'eye'}
                onPress={() => setShowPass((s) => !s)}
              />
            }
            style={styles.input}
          />

          <Button
            mode="contained"
            icon="login"
            onPress={handleLogin}
            style={styles.button}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}
          >
            Entrar
          </Button>

          <HelperText type="info" style={styles.hint}>
            Dica: treinador "ash" · senha "pikachu"
          </HelperText>
        </Surface>
      </View>

      <Snackbar
        visible={error}
        onDismiss={() => setError(false)}
        duration={3000}
        style={styles.snackbar}
        action={{ label: 'OK', onPress: () => setError(false) }}
      >
        Treinador ou senha incorretos!
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#D32F2F',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    overflow: 'hidden',
  },
  bgBallTop: {
    position: 'absolute',
    top: -90,
    right: -90,
    opacity: 0.12,
  },
  bgBallBottom: {
    position: 'absolute',
    bottom: -80,
    left: -80,
    opacity: 0.12,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  logo: {
    marginBottom: 14,
  },
  title: {
    color: '#fff',
    fontWeight: '900',
    letterSpacing: 1,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.92)',
    marginTop: 2,
    marginBottom: 24,
  },
  card: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
  },
  cardTitle: {
    fontWeight: '800',
    marginBottom: 18,
  },
  input: {
    marginBottom: 14,
    backgroundColor: '#fff',
  },
  button: {
    marginTop: 6,
    borderRadius: 12,
  },
  buttonContent: {
    height: 50,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  hint: {
    textAlign: 'center',
    marginTop: 8,
  },
  snackbar: {
    backgroundColor: '#1B1B1F',
  },
});
