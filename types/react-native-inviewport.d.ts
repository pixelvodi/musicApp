declare module 'react-native-inviewport' {
    import * as React from 'react';
    import { StyleProp, ViewStyle } from 'react-native';

    interface InViewPortProps {
        onChange: (isVisible: boolean) => void;
        delay?: number;
        style?: StyleProp<ViewStyle>;
        children?: React.ReactNode;
    }

    export default class InViewPort extends React.Component<InViewPortProps> {}}