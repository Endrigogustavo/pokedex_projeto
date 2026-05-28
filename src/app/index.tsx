import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  Alert,
  Image,
} from 'react-native';

import { useRouter } from 'expo-router';

import Button from '@/component/button';
import Input from '@/component/input';

export default function Index() {
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [hover, setHover] = useState(false);

  const router = useRouter();

  const handleLogin = () => {
    console.log(
      'Usuário:',
      usuario,
      '| Senha:',
      senha
    );

    if (
      usuario.trim() === 'Neyma' &&
      senha.trim() === 'vaiBrasil'
    ) {
      console.log('entrou');

      router.push('/dashboard');
    } else {
      console.log('nao entrou');

      Alert.alert(
        'Erro',
        'Usuário ou senha incorretos.'
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Passe o mouse no menino ney
      </Text>

      <View
        style={styles.neymarContainer}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <Image
          source={
            hover
              ? require('../../assets/images/neymar-aberto.png')
              : require('../../assets/images/neymar-fechado.png')
          }
          style={styles.neymarImage}
          resizeMode="contain"
        />

        {hover && (
          <View style={styles.loginCard}>
            <Text style={styles.loginTitle}>
              Login
            </Text>

            <Input
              placeholder="Usuário"
              value={usuario}
              onChangeText={setUsuario}
              autoCapitalize="none"
              style={{
                marginBottom: 16,
              }}
            />

            <Input
              placeholder="Senha"
              value={senha}
              onChangeText={setSenha}
              secureTextEntry
              style={{
                marginBottom: 24,
              }}
            />

            <Button
              title="Entrar"
              onPress={handleLogin}
            />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  title: {
    color: 'white',
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 30,
  },

  neymarContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  neymarImage: {
    width: 350,
    height: 350,
  },

  loginCard: {
    position: 'absolute',
    bottom: 40,

    width: 280,

    backgroundColor: 'rgba(255,255,255,0.95)',

    borderRadius: 20,
    padding: 20,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },

  loginTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#150b80',
  },
});