import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function Library() {
    return (
        <View style ={styles.container}>
            <Text style={{ fontFamily: 'MyFont', fontSize: 30, color: 'white' }}>
  Проверка шрифта
</Text>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#121212"
    },
    txt: {
        color: "white"
    }
})
