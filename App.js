import { StatusBar } from 'expo-status-bar';
import React, {useEffect, useState} from "react";
import { StyleSheet, Text, View, TouchableOpacity, TouchableHighlight, TouchableWithoutFeedback, Pressable, TextInput, ScrollView, Alert } from 'react-native';     
//TouchableOpacity : 누르는 이벤트를 listen할 준비가 된 view
//TouchableHighlight : 눌렀을 때 배경색이 바뀌는 등의 설정 가능
//TouchableWithoutFeedback : 화면의 가장 위에서 일어나는 탭 이벤트를 listen
//Pressable : TouchableWithoutFeedback의 새 버전이라고 볼 수 있음(더 다양한 속성이 많음)
import { theme } from "./colors.js";
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Fontisto} from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';

const STORAGE_KEY="@toDos";
const WORKING_KEY="@working";   //working 상태를 asyncstorage에 저장하는 함수

export default function App() {
  const [working, setWorking] = useState(true);
  const [text, setText] = useState("");
  const [toDos, setToDos] = useState({});
  const [editingKey, setEditingKey] = useState(null); // 수정 중인 ToDo의 키

  const travel = () => {
    setWorking(false);    //travel을 호출하면 setWorking(false)
    saveWorking(false);
  }    
  const work = () => {
    setWorking(true);    //work를 호출하면 setWorking(true)
    saveWorking(true);
  }
  const onChangeText = (payload) => setText(payload);   //유저가 뭔가 입력하면 setText 실행(payload : 전송되는 데이터나 정보를 지칭)
  const saveToDos = async(toSave) => {     //toDos를 string으로 바꿔주고 await AsyncStorage.setItem 해줌
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave))   //JSON.stringify는 object를 string으로 바꿔줌 
  }
  const loadToDos = async() => {
    const s = await AsyncStorage.getItem(STORAGE_KEY)
    setToDos(JSON.parse(s));   
  };
  const saveWorking = async (isWorking) => {    //isWorking : 저장하려는 'working'상태
    await AsyncStorage.setItem(WORKING_KEY, JSON.stringify(isWorking));
                            //저장할 데이터 키, 'isWorking'값을 문자열로 변환
  };
  const loadWorking = async () => {   //loadWorking : 'working' 상태를 불러와서 설정
    const isWorking = await AsyncStorage.getItem(WORKING_KEY);
    if (isWorking !== null) {
      setWorking(JSON.parse(isWorking));
    }
  };
  // saveWorking, loadWorking : 'working'상태를 asyncstorage에 저장하고 불러오는 역할
  useEffect(() => {
    loadToDos();
    loadWorking();
  }, []);
  const addToDo = async () => {
    if(text == ""){
      return;      //todo가 비어있다면 아무것도 하지 않고 return
    }
    const newToDos = {...toDos, [Date.now()]: {text, working, done:false }};    //object assign 대신 ES6로 만들기
                      // toDos의 내용을 가진 object 만들기를 원할때 콤마를 사용하고 new todo 적기
    setToDos(newToDos);
    await saveToDos(newToDos);
    setText("");    //공란으로 만들기
  };
  console.log(toDos);   //work의 id값과 travel의 id값이 다르고, 각각 true/false 인 것을 확인(2개의 object를 state 수정 없이 결합)

  const deleteToDo = async(key) => {
    Alert.alert(
      "ToDo를 삭제하시겠습니까?", 
      "확실한가요?", [
      { text : "취소"},
      { text : "삭제", 
      style : "destructive",
      onPress : async() => {
        const newToDos = {...toDos}   //state의 내용으로 새로운 object 만들기
        delete newToDos[key]    //delete 키워드를 이용해 newToDos 안에 있는 key 지우기
        setToDos(newToDos);   //state 업데이트
        await saveToDos(newToDos);    //위 행동을 Async storage에 저장
      }},
    ]);
    return;
  };

  const startEditing = (key) => { // 수정 시작 함수 추가
    setEditingKey(key);
    setText(toDos[key].text);
  };
  const editToDo = async () => { // 수정 완료 함수 추가
    if (text === "") {
      return;
    }
    const newToDos = {...toDos, [editingKey]: { ...toDos[editingKey], text }};
    setToDos(newToDos);
    await saveToDos(newToDos);
    setEditingKey(null);
    setText("");
  };

  const toggleDone = async (key) => { // 완료 상태 토글 함수 추가
    const newToDos = {...toDos, [key]: { ...toDos[key], done: !toDos[key].done }};    //done 속성이 true면 false, false면 true로 변경
    setToDos(newToDos);
    await saveToDos(newToDos);
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
        onSubmitEditing={editingKey ? editToDo : addToDo}    
        onChangeText={onChangeText} 
        returnKeyType="done"
        value = {text}
        placeholder={working ? "할 일을 추가하세요" : "어디로 놀러 갈까요?"} 
        style={styles.input}
      ></TextInput>

      <ScrollView>
        {Object.keys(toDos)
        .sort((a, b) => {   //sort메서드 : 두 항목을 비교하는 함수를 인수로 받음
          if (toDos[a].done === toDos[b].done) return 0;    //두 항목의 상태가 동일한지 확인후 동일하면 그대로 둠
          if (toDos[a].done) return 1;    //a의 완료상태가 true인경우 b보다 뒤에 위치시켜야 하기때문에 return 1을 반환하여 두번째 항목을 앞으로 이동시킴
          return -1;    //b가 a보다 먼저 나와야 하므로 return -1을 반환하여 첫번째 항목을 앞으로 이동
        }) // 완료된 항목을 하단에 표시    
        .map((key) => (    //todo 안에 있는 key들 살펴보기(모든 id들을 말함)
          toDos[key].working === working ?      //working 이면 보여주기
          <View style={styles.toDo} key={key}>
            <Text style={[styles.toDoText, toDos[key].done ? styles.doneText : null]}>{toDos[key].text}</Text> 
            <View style={styles.icons}> 
                <TouchableOpacity onPress={() => startEditing(key)}> 
                  <MaterialIcons name="edit" size={18} color={theme.grey} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => toggleDone(key)}> 
                    <Fontisto name={toDos[key].done ? "checkbox-active" : "checkbox-passive"} size={18} color={theme.grey} />
                  </TouchableOpacity>
                <TouchableOpacity onPress={() => deleteToDo(key)}> 
                  <Fontisto name="trash" size={18} color={theme.grey} />
                </TouchableOpacity>
              </View>
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
  },
  doneText: { 
    textDecorationLine: "line-through",
  },
  icons: { 
    flexDirection: "row",
    gap: 10,
  },
});
