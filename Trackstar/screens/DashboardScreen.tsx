import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SectionList,
  StyleSheet
} from "react-native";
import { Card, TextInput, Button } from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import CircleCheckBox, { LABEL_POSITION } from "react-native-circle-checkbox";
import Modal from "react-native-modal";
import { iOSUIKit } from "react-native-typography";

import { Task, Evaluation, Course } from "../models";
import {
  CourseMapper,
  CourseMapperImpl,
  EvaluationMapper,
  EvaluationMapperImpl,
  TaskMapper,
  TaskMapperImpl
} from "../data_mappers";

interface TaskDescriptor {
  task: Task;
  evalName: string;
  courseCode: string;
}

const HomeScreen = props => {
  const [formattedTaskData, setFormattedTaskData] = useState<TaskDescriptor[]>(
    []
  );
  const [fakeState, setFakeState] = useState(new Date());
  const [modalActive, setModalActive] = useState(false);
  const [taskBeingCompleted, setTaskBeingCompleted] = useState<
    TaskDescriptor
  >(null);

  const taskDataRef = useRef(formattedTaskData);
  const setTaskData = data => {
    taskDataRef.current = data;
    setFormattedTaskData(data);
  };

  const navigation = props.navigation;

  useEffect(() => {
    const formattedTasks = formatData().then(data => {
      setTaskData(data);
    });
  }, []);

  const handleTaskCompletion = useCallback(id => {
    let taskToUpdate: Task;

    taskDataRef.current.forEach(currTask => {
      if (currTask.task.id === id) {
        taskToUpdate = currTask.task;
      }
    });

    taskToUpdate.complete = !taskToUpdate.complete;
    updateTask(taskToUpdate);

    setModalActive(true);
    // trigger re render
    setFakeState(new Date());
  }, []);

  const handleTaskSelection = useCallback(id => {
    const task = findTaskById(taskDataRef.current, id);
    setTaskBeingCompleted(task);
    setModalActive(true);
  }, [taskDataRef.current]);

  const tasksMarkup = generateTasksMarkup(
    formattedTaskData,
    handleTaskSelection,
  );

  const modalMarkup = taskBeingCompleted !== null ? (
    <Modal isVisible={modalActive} hasBackdrop={true}>
      <View
        style={{
          marginTop: 40,
          marginBottom: 40,
          backgroundColor: "white",
          justifyContent: "center",
          alignItems: "center"
        }}
      >
        <Card.Content>
          <Text style={iOSUIKit.largeTitleEmphasized}>{taskBeingCompleted.task.title}</Text>
          <Text style={iOSUIKit.largeTitleEmphasized}>Complete task</Text>
          <View style={{ flex: 1, marginTop: 20 }}>
            <Text>How long did you spend on that task?</Text>
            <TextInput
              label="Time (in minutes)"
              keyboardType="numeric"
              onChangeText={() => {}}
            />
          </View>
          <Button
            mode="contained"
            onPress={() => {
              setModalActive(false);
            }}
          >
            Submit
          </Button>
        </Card.Content>
      </View>
    </Modal>
  ) : null;

  return (
    <LinearGradient
      colors={["#bcf7ed", "#5273eb"]}
      style={{ flex: 1, flexDirection: "column", alignItems: "center" }}
    >
      <View style={{ flexDirection: "column", marginTop: 100 }}>
        <Text style={{ fontSize: 45, color: "white", textAlign: "center" }}>
          Welcome Back!
        </Text>
        <Text style={{ fontSize: 15, color: "white", textAlign: "center" }}>
          Next Evaluation: PHIL 1200 - Test 1
        </Text>
        <Text style={{ fontSize: 15, color: "white", textAlign: "center" }}>
          Due March 10th
        </Text>
      </View>
      <ScrollView style={{ marginTop: 50 }}>
        {modalMarkup}
        {tasksMarkup}
      </ScrollView>
    </LinearGradient>
  );
};

function generateTasksMarkup(
  tasks: TaskDescriptor[],
  handleModalChange
) {
  const allTasks = [];

  tasks.forEach((currTask: TaskDescriptor) => {
    const {
      task: { title, complete, priority, id },
      evalName,
      courseCode
    } = currTask;

    const formatted_title = `${priority}. ${title}`;
    const formatted_subtitle = `${courseCode} - ${evalName}`;

    const completeText = complete ? <Text>Complete</Text> : null;
    const opacity = complete ? 0.5 : 1;

    const taskMarkup = (
      <View opacity={opacity}>
        <Card style={{ width: 350, marginBottom: 10 }}>
          <Card.Title title={formatted_title} subtitle={formatted_subtitle} />
          <Card.Content style={{ flex: 1, flexDirection: "row" }}>
            <Text style={{ flex: 8 }}>
              {courseCode} - {evalName}
            </Text>
            {completeText}
            <CircleCheckBox
              style={{ flex: 2 }}
              // checked={item.title == "1. Read Chapter 3" ? true : false}
              checked={complete ? true : false}
              outerColor={"#5273eb"}
              innerColor={"#5273eb"}
              onToggle={() => {handleModalChange(id)}}
            />
          </Card.Content>
        </Card>
      </View>
    );

    allTasks.push(<View key={id}>{taskMarkup}</View>);
  });

  return allTasks;
}

async function formatData() {
  const taskMapper: TaskMapper = new TaskMapperImpl();
  const evalMapper: EvaluationMapper = new EvaluationMapperImpl();
  const courseMapper: CourseMapper = new CourseMapperImpl();

  const formattedData = [];
  const rawData: Task[] = await taskMapper.all();
  console.log("raw");
  console.log(rawData);

  for (let i = 0; i < rawData.length; i++) {
    const task = rawData[i];
    const evaluation: Evaluation = await evalMapper.find(task.evaluation_id);
    const course: Course = await courseMapper.find(evaluation.course_code);

    const taskInfo: TaskDescriptor = {
      task: task,
      evalName: evaluation.title,
      courseCode: course.code
    };

    formattedData.push(taskInfo);
  }

  return formattedData;
}

async function updateTask(task: Task) {
  const taskMapper: TaskMapper = new TaskMapperImpl();

  taskMapper.update(task);
}

function findTaskById(tasks: TaskDescriptor[], id) {
  let task: TaskDescriptor;
  console.log('the tasks');
  tasks.forEach((item) => {
    if (item.task.id === id) {
      console.log(item.task.title, item.task.id);
      task = item;
    }
  });
  //console.log(tasks);
  return task;
}

export default HomeScreen;
