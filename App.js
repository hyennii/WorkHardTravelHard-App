import { StatusBar } from 'expo-status-bar';
import React, {useEffect, useState} from "react";
import { StyleSheet, Text, View, TouchableOpacity, TouchableHighlight, TouchableWithoutFeedback, Pressable, TextInput, ScrollView, Alert } from 'react-native';     
//TouchableOpacity : 누르는 이벤트를 listen할 준비가 된 view
//TouchableHighlight : 눌렀을 때 배경색이 바뀌는 등의 설정 가능
//TouchableWithoutFeedback : 화면의 가장 위에서 일어나는 탭 이벤트를 listen
//Pressable : TouchableWithoutFeedback의 새 버전이라고 볼 수 있음(더 다양한 속성이 많음)
import { theme } from "./colors.js";
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY="@toDos"

export default function App() {
  const [working, setWorking] = useState(true);
  const [text, setText] = useState("");
  const [toDos, setToDos] = useState({});
  const travel = () => setWorking(false);    //travel을 호출하면 setWorking(false)
  const work = () => setWorking(true);    //work를 호출하면 setWorking(true)
  const onChangeText = (payload) => setText(payload);   //유저가 뭔가 입력하면 setText 실행(payload : 전송되는 데이터나 정보를 지칭)
  const saveToDos = async(toSave) => {     //toDos를 string으로 바꿔주고 await AsyncStorage.setItem 해줌
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave))   //JSON.stringify는 object를 string으로 바꿔줌 
  }
  const loadToDos = async() => {
    const s = await AsyncStorage.getItem(STORAGE_KEY)
    setToDos(JSON.parse(s));   
  };
  useEffect(() => {
    loadToDos();
  }, []);
  const addToDo = async () => {
    if(text == ""){
      return;      //todo가 비어있다면 아무것도 하지 않고 return
    }
    const newToDos = {...toDos, [Date.now()]: {text, working }}    //object assign 대신 ES6로 만들기
                      // toDos의 내용을 가진 object 만들기를 원할때 콤마를 사용하고 new todo 적기
    setToDos(newToDos);
    await saveToDos(newToDos);
    setText("");    //공란으로 만들기
  };
  console.log(toDos);   //work의 id값과 travel의 id값이 다르고, 각각 true/false 인 것을 확인(2개의 object를 state 수정 없이 결합)

  const deleteToDo = async(key) => {
    Alert.alert("ToDo를 삭제하시겠습니까?", "확실한가요?");
    return;
    const newToDos = {...toDos}   //state의 내용으로 새로운 object 만들기
    delete newToDos[key]    //delete 키워드를 이용해 newToDos 안에 있는 key 지우기
    setToDos(newToDos);   //state 업데이트
    await saveToDos(newToDos);    //위 행동을 Async storage에 저장
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <TouchableOpacity onPress={work}>             
          <Text style={{...styles.btnText, color: working ? "white" : theme.grey}}>Work</Text>        
        </TouchableOpacity>

        <TouchableOpacity onPress={travel}>                     
          <Text style={{...styles.btnText, color: !working ? "white" : theme.grey}}>Travel</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        onSubmitEditing={addToDo}
        onChangeText={onChangeText} 
        returnKeyType="done"
        value = {text}
        placeholder={working ? "할 일을 추가하세요" : "어디로 놀러 갈까요?"} 
        style={styles.input}
      ></TextInput>

      <ScrollView>
        {Object.keys(toDos).map((key) => (    //todo 안에 있는 key들 살펴보기(모든 id들을 말함)
          toDos[key].working === working ?      //working 이면 보여주기
          <View style={styles.toDo} key={key}>
            <Text style={styles.toDoText}>{toDos[key].text}</Text>
            <TouchableOpacity onPress={() => deleteToDo(key)}>
              <Text>x</Text>
            </TouchableOpacity>
          </View> : null    //working이 아니면 보여주지 않기
        ))}
      </ScrollView>

    </View>
  );
}

// onPress속성 : 유저가 Touchable을 눌렀을 때 실행되는 이벤트
// 중괄호를 두번쓰고 ... 쓰면 : btnText의 모든 스타일 가져다줌
// payload 를 사용하는 이유 : 
  // 1. 데이터의 전달: payload는 이벤트 객체 전체 대신 중요한 데이터(텍스트)를 전달할 때 사용되며, 이는 함수가 어떤 종류의 데이터를 받을지 명확하게 나타냄
  // 2.명확성: 함수 인자의 이름을 payload로 지정함으로써, 코드 읽는 사람이 해당 함수가 무엇을 기대하는지 더 명확하게 이해할 수 있음
  // 3.일반적인 관례: 소프트웨어 개발에서 payload는 전송되는 데이터나 정보의 내용을 나타내는 데 자주 사용되며, 이는 특히 API 요청이나 상태 관리에서 자주 보이는 패턴
// onSubmitEditing : 유저가 키패드에서 submit 누르면 발생하는 이벤트
// parse : string을 javascript object로 만들어줌

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
  },
  input: {
    backgroundColor:"white",
    paddingHorizontal:15,
    paddingVertical : 20,
    borderRadius : 30,
    marginVertical : 20,
    fontSize : 16
  },
  toDo:{
    backgroundColor: theme.toDoBg,
    marginBottom: 10,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  toDoText:{
    color:"white",
    fontSize: 16,
    fontWeight: 500
  }
});
