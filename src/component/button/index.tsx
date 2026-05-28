import { TouchableOpacity, Text, TouchableOpacityProps, StyleProp, ViewStyle } from "react-native"

import {Styles} from './style'

type ButtonProps = TouchableOpacityProps & {
  title: string;
  style?: StyleProp<ViewStyle>;
}

export default function Button({ title, style, ...rest }: ButtonProps) {
  return (
    <TouchableOpacity style={[Styles.button, style, ]} {...rest}>
      <Text style={Styles.title}>{title}</Text>
    </TouchableOpacity>
  );
}