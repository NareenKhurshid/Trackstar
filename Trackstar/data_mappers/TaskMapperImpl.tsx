import TaskMapper from "./TaskMapper";
import Task from "../models/Task";
import DBConnection from "../DBConnection";


export default class TaskMapperImpl implements TaskMapper {
  db = DBConnection.open()

  constructor() {
    this.createTable()
  }

  insert(t: Task): void {
    this.db.transaction(
      tx => {
        tx.executeSql("insert into Task (title, due_date, est_duration, priority, complete, eval_id, id) values (?, ?, ?, ?, ?, ?, ?)", [t.title, JSON.stringify(t.due_date), t.est_duration, t.priority, t.complete, t.evaluation_id, t.id]);
      },
      null
    );
  };

  update(t: Task): void {
    this.db.transaction(
      tx => {
        tx.executeSql("update Task set title=?, due_date=?, est_duration=?, priority=?, complete=? where id=?", [t.title, JSON.stringify(t.due_date), t.est_duration, t.priority, t.complete, t.id]);
      },
      null
    );
  };

  delete(t: Task): void {
    this.db.transaction(
      tx => {
        tx.executeSql("delete from Task where id=?", [t.id]);
      },
      null
    );
  };

  all(): Promise<Task[]> {
    return new Promise((resolve) => {
      const task_objs = []
      this.db.transaction(tx => {
        tx.executeSql("select * from Task", [], (_, { rows: { _array } }) => {
          _array.forEach(task => {
            task_objs.push(new Task(task.title, new Date(JSON.parse(task.due_date)), task.est_duration, task.eval_id, task.complete, task.priority, task.id))
          })
          resolve(task_objs)
        })
      })
    })
  };

  find(id: number): Promise<Task> {
    return new Promise((resolve) => {
      this.db.transaction(tx => {
        tx.executeSql("select * from Task where id = ?", [id], (_, { rows: { _array } }) => {
          resolve(_array[0])
        })
      })
    })
  };

  findByEval(evalID: number): Promise<Task[]> {
    return new Promise((resolve) => {
      const task_objs = []
      this.db.transaction(tx => {
        tx.executeSql("select * from Task where eval_id = ?", [evalID], (_, { rows: { _array } }) => {
          _array.forEach(task => {
            task_objs.push(new Task(task.title, new Date(JSON.parse(task.due_date)), task.est_duration, task.eval_id, task.complete, task.priority, task.id))
          })
          resolve(task_objs)
        })
      })
  })
  }

  createTable(): void {
    this.db.transaction(tx => {
      tx.executeSql("create table if not exists Task (id integer primary key, title text not null, due_date text not null, est_duration number not null, priority number, complete boolean default 0, eval_id integer not null, foreign key(eval_id) references Evaluation(id))")
    })
  }
}