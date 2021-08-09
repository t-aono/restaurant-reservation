<template>
  <v-row class="fill-height">
    <v-col>
      <v-sheet height="64">
        <v-toolbar flat>
          <v-btn outlined class="mr-4" color="grey darken-2" @click="setToday">
            今日
          </v-btn>
          <v-btn fab text small color="grey darken-2" @click="prev">
            <v-icon small> mdi-chevron-left </v-icon>
          </v-btn>
          <v-btn fab text small color="grey darken-2" @click="next">
            <v-icon small> mdi-chevron-right </v-icon>
          </v-btn>
          <v-toolbar-title v-if="$refs.calendar">
            {{ $refs.calendar.title }}
          </v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn
            outlined
            class="mr-4"
            color="grey darken-2"
            @click="openForm"
            v-show="type === 'day'"
          >
            予約の追加
          </v-btn>
          <v-menu bottom right>
            <template v-slot:activator="{ on, attrs }">
              <v-btn outlined color="grey darken-2" v-bind="attrs" v-on="on">
                <span>{{ typeToLabel[type] }}</span>
                <v-icon right> mdi-menu-down </v-icon>
              </v-btn>
            </template>
            <v-list>
              <v-list-item @click="type = 'week'">
                <v-list-item-title>週</v-list-item-title>
              </v-list-item>
              <v-list-item @click="type = 'month'">
                <v-list-item-title>月</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </v-toolbar>
      </v-sheet>
      <v-sheet height="700">
        <v-calendar
          ref="calendar"
          v-model="focus"
          color="grey lighten-1"
          :events="events"
          :event-color="getEventColor"
          :type="type"
          :interval-format="intervalFormat"
          :first-time="intervals[0]"
          :interval-count="12"
          @click:event="showEvent"
          @click:more="viewDay"
          @click:date="viewDay"
          @change="updateRange"
        >
        </v-calendar>
        <v-menu
          v-model="newReserve"
          :close-on-content-click="false"
          min-width="350"
          nudge-bottom="200"
          nudge-right="100"
        >
          <v-card color="grey lighten-4" min-width="350px" flat>
            <v-toolbar color="green" dark>
              <v-toolbar-title>予約フォーム</v-toolbar-title>
              <v-spacer></v-spacer>
              <v-btn icon @click="newReserve = false">
                <v-icon>mdi-close</v-icon>
              </v-btn>
            </v-toolbar>
            <v-card-text>
              <span>お名前を入力してください。</span>
              <v-text-field v-model="name"></v-text-field>
            </v-card-text>
            <v-card-text>
              <span>メールアドレスを入力してください。</span>
              <v-text-field v-model="mail"></v-text-field>
            </v-card-text>
            <v-card-text>
              <span>時間と人数を選択して下さい。</span>
            </v-card-text>
            <v-card-text>
              <v-select
                :items="intervals"
                label="予約時刻"
                outlined
                v-model="time"
              ></v-select>
              <v-select
                :items="[1, 2, 3, 4, 5]"
                label="予約人数"
                outlined
                v-model="people"
              ></v-select>
            </v-card-text>
            <v-card-text>
              <v-textarea
                outlined
                v-model="remarks"
                label="備考"
                rows="2"
              ></v-textarea>
            </v-card-text>
            <v-card-actions>
              <v-btn color="green" dark class="ml-3 mb-3" @click="addEvent">
                予約
              </v-btn>
            </v-card-actions>
            <v-progress-linear
              indeterminate
              color="green"
              v-show="sendProgress"
              height="20"
            ></v-progress-linear>
          </v-card>
        </v-menu>
        <v-menu
          v-model="selectedOpen"
          :close-on-content-click="false"
          :activator="selectedElement"
          offset-x
          min-width="500"
        >
          <v-card color="grey lighten-4" min-width="350px" flat>
            <v-toolbar :color="selectedEvent.color" dark>
              <v-toolbar-title>
                <span v-html="selectedEvent.status"></span>
              </v-toolbar-title>
            </v-toolbar>
            <v-card-text v-if="selectedEvent.start">
              <div v-html="selectedEvent.name"></div>
              <span
                v-html="selectedEvent.start.getHours() + ':' + ('0' + selectedEvent.start.getMinutes()).slice(-2)"
              ></span>
              <span>～</span>
              <span
                v-html="selectedEvent.end.getHours() + ':' + ('0' + selectedEvent.end.getMinutes()).slice(-2)"
              ></span>
              <div v-html="selectedEvent.people + ' 名様'"></div>
              <div><span style="white-space: pre-wrap" v-html="selectedEvent.remarks"></span></div>
            </v-card-text>
          </v-card>
        </v-menu>
      </v-sheet>
    </v-col>
  </v-row>
</template>

<script>
import db from "../firebase/firestore";

export default {
  data: () => ({
    focus: "",
    type: "month",
    typeToLabel: {
      month: "月",
      week: "週",
      day: "日",
    },
    selectedEvent: {},
    selectedElement: null,
    selectedOpen: false,
    newReserve: false,
    events: [],
    counts: [],
    colors: ["green"],
    names: ["event"],
    intervals: [],
    name: "",
    mail: "",
    time: "",
    people: "",
    remarks: "",
    ym: "",
    editIndex: null,
    sendProgress: false,
  }),
  mounted() {
    this.$refs.calendar.checkChange();
    this.ym = this.$refs.calendar.$data.lastStart.year + "-" + ("0" + this.$refs.calendar.$data.lastStart.month).slice(-2);
    for (let i = 11; i <= 21; i++) {
      if (i !== 15 && i !== 16) {
        this.intervals.push(i + ":00");
        if (i !== 14 && i !== 21) this.intervals.push(i + ":30");
      }
    }
  },
  methods: {
    viewDay({ date }) {
      const today = new Date();
      const target = new Date(date);
      if (today.getTime() > target.getTime()) {
        alert("明日以降の日付を選択してください。");
      } else {
        this.focus = date;
        this.type = "day";
      }
    },
    getEventColor(event) {
      return event.color;
    },
    setToday() {
      this.focus = "";
    },
    prev() {
      this.$refs.calendar.prev();
    },
    next() {
      this.$refs.calendar.next();
    },
    showEvent({ nativeEvent, event }) {
      const open = () => {
        this.selectedEvent = event;
        this.selectedElement = nativeEvent.target;
        requestAnimationFrame(() =>
          requestAnimationFrame(() => (this.selectedOpen = true))
        );
      };

      if (this.selectedOpen) {
        this.selectedOpen = false;
        requestAnimationFrame(() => requestAnimationFrame(() => open()));
      } else {
        open();
      }

      nativeEvent.stopPropagation();
    },
    intervalFormat(interval) {
      return interval.time;
    },
    openForm() {
      this.newReserve = true;
    },
    addEvent() {
      // 入力チェック
      let err = '';
      if (!this.name) err += 'お名前を入力してください。\n';
      if (!this.mail) err += 'メールアドレスを入力してください。\n';
      if (!this.time) err += '時刻を選んでください。\n';
      if (!this.people) err += '人数を選んでください。\n';
      if (err) {
        alert(err);
        return;
      }
      this.sendProgress = true; // プログレスバー表示
      const first = new Date(this.focus + " " + this.time);
      const second = new Date(this.focus);
      second.setHours(first.getHours() + 2);
      second.setMinutes(first.getMinutes());

      // 予約の追加
      const event = {
        index: this.events.length,
        date: this.focus,
        name: this.name + " 様",
        mail: this.mail,
        start: first,
        end: second,
        people: this.people,
        remarks: this.remarks,
        status: "仮予約",
        color: "lime",
        timed: true,
      };
      this.events.push(event);
      db.collection("reservations").doc(this.focus.slice(0, 7)).set({
        events: this.events,
      }).then(() => {
        // 新規の場合は受付完了メール送信
        this.resetForm();  // if (this.editIndex === null) this.sendEmail(first);
        this.updateRange();
      });
    },
    sendEmail(date) {
      this.$loadScript("https://smtpjs.com/v3/smtp.js").then(() => {
        window.Email &&
          window.Email.send({
            Host: "smtp.sendgrid.net",
            Username: process.env.VUE_APP_SENDGRID_USERNAME,
            Password: process.env.VUE_APP_SENDGRID_APIKEY,
            To: this.mail,
            From: "restaurant-reseravation@test.com",
            Subject: "予約受付完了",
            Body: `${
              this.name
            } 様<br><br>下記の内容で仮予約を受付ました。<br>日程：${date.getFullYear()}年${
              date.getMonth() + 1
            }月${date.getDate()}日 ${this.time}<br>人数：${
              this.people
            }<br><br>内容を確認後に予約を確定いたしますので、しばらくお待ち下さい。`,
          }).then((message) => {
            if (message !== "OK") alert(message);
            this.resetForm();
          });
      });
    },
    resetForm() {
      this.name = "";
      this.mail = "";
      this.time = "";
      this.people = "";
      this.remarks = "";
      this.newReserve = false;  // 予約フォーム非表示
      this.sendProgress = false; // プログレスバー非表示
    },
    updateRange() {
      this.events = [];
      db.collection("reservations").get(this.ym)
      .then((snapshot) => {
        snapshot.forEach((doc) => {
          doc.data().events.forEach((data, index) => {
            const event = {
              index: index,
              name: data.name,
              mail: data.mail,
              status: data.status,
              start: new Date(data.start.toDate()),
              end: new Date(data.end.toDate()),
              people: data.people,
              remarks: data.remarks,
              color: data.color,
              timed: data.timed,
            };
            this.events.push(event);
          });
        });
      });
    },
    countReserves(time) {
      const timeIndex = this.intervals.findIndex((i) => i === time);
      const after1 = this.intervals[timeIndex + 1];
      const after2 = this.intervals[timeIndex + 2];
      const after3 = this.intervals[timeIndex + 3];
      let count = 0;
      this.events.forEach((e) => {
        if (this.focus === e.start.getFullYear() + "-" + ("0" + (e.start.getMonth() + 1)).slice(-2) + "-" + ("0" + e.start.getDate()).slice(-2)) {
          const reserveStart = e.start.getHours() + ":" + ("0" + e.start.getMinutes()).slice(-2);
          const reserveEnd = e.end.getHours() + ":" + ("0" + e.end.getMinutes()).slice(-2);
          if (time >= reserveStart && time < reserveEnd) count++;
          else if (after1 >= reserveStart && after1 < reserveEnd) count++;
          else if (after2 >= reserveStart && after2 < reserveEnd) count++;
          else if (after3 >= reserveStart && after3 < reserveEnd) count++;
        }
      });
      return count;
    },
  },
  watch: {
    time: function (val) {
      if (this.countReserves(val) >= 3) {
        alert("満席のため予約できません。");
        setTimeout(() => {
          this.time = "";
        }, 1);
      }
    },
  },
};
</script>