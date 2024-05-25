import { StatusBar } from 'expo-status-bar';
import React from "react";
import { StyleSheet, Text, View, TouchableOpacity, TouchableHighlight } from 'react-native';     
//TouchableOpacity : 누르는 이벤트를 listen할 준비가 된 view
//TouchableHighlight : 눌렀을 때 배경색이 바뀌는 등의 설정 가능
import { theme } from "./colors.js";

export default function App() {
  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <TouchableOpacity>
          <Text style={styles.btnText}>Work</Text>        
        </TouchableOpacity>

        <TouchableHighlight 
        underlayColor="#DDD"
        onPress={() => console.log("pressed")}
        >                     
          <Text style={styles.btnText}>Travel</Text>
        </TouchableHighlight>
      </View>
    </View>
  );
}

// onPress속성 : 유저가 Touchable을 눌렀을 때 실행되는 이벤트

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
    paddingHorizontal: 20,
  },
  header: {
    justifyContent:"space-between",
    flexDirection:"row",
    marginTop: 100,
  },
  btnText: {
    fontSize: 38,
    fontWeight: "600",
    color:"white",
  }
});
