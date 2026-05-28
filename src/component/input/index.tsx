import { TextInput, TextInputProps, StyleProp, ViewStyle } from "react-native"

import { Styles } from './style'

type InputProps = TextInputProps & {
  style?: StyleProp<ViewStyle>;
  placeholder?: string;
}

export default function Input({ placeholder = "Digite algo...", style, ...rest }: InputProps) {
  return (
    <TextInput 
      style={[Styles.input, style]} 
      placeholder={placeholder}
      placeholderTextColor="#999"
      {...rest} 
    />
  );
}
