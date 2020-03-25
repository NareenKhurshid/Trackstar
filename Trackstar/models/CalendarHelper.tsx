import Task from "./Task";
import { Platform } from 'react-native';
import * as Calendar from 'expo-calendar';
import User from "./User";
import UserMapper from "../data_mappers/UserMapper";
import UserMapperImpl from "../data_mappers/UserMapperImpl";

export default class CalendarHelper {

  static async addEvent(task: Task) {
    const { status } = await Calendar.requestCalendarPermissionsAsync();
    if (status === 'granted') {
      // const calendars = await Calendar.getCalendarsAsync();
      // console.log('Here are all your calendars:');
      // console.log({ calendars });
      let calendarID: string;
      let userMapper: UserMapper = new UserMapperImpl;
      await userMapper.getUser()
      let user = User.getInstance()
      console.log(`calendar id: ${user.calendarId}`)

      if (user.calendarId) {
        calendarID = user.calendarId;
      }
      else {
        const defaultCalendarSource =
        Platform.OS === 'ios'
          ? await CalendarHelper.getDefaultCalendarSource()
          : { isLocalAccount: true, name: 'Trackstar' };

        calendarID = await Calendar.createCalendarAsync({
          title: 'Trackstar',
          color: 'blue',
          entityType: Calendar.EntityTypes.EVENT,
          sourceId: defaultCalendarSource.id,
          source: defaultCalendarSource,
          name: 'internalCalendarName',
          ownerAccount: 'personal',
          accessLevel: Calendar.CalendarAccessLevel.OWNER,
        });
        user.calendarId = calendarID;
        userMapper.update(user);
      }

      Calendar.createEventAsync(calendarID, {
        title: task.title,
        startDate: task.due_date, // maybe change this to be due_date minus est_time
        endDate: task.due_date
      });
    }
    else {
      console.log("access denied")
    }
  }

  // private static async requestPermission() {
  //   const { status } = await Calendar.requestCalendarPermissionsAsync();
  //   if (status === 'granted') {
  //     const calendars = await Calendar.getCalendarsAsync();
  //     console.log('Here are all your calendars:');
  //     console.log({ calendars });
  //   }
  // }

  private static async getDefaultCalendarSource() {
    const calendars = await Calendar.getCalendarsAsync();
    let defaultCalendars = calendars.filter(each => each.source.name === 'Default');
    if (defaultCalendars[0] == undefined) {
      defaultCalendars = calendars.filter(each => each.source.name === 'iCloud');
    }
    return defaultCalendars[0].source;
  }
}