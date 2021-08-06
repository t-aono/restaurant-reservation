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
          <v-btn outlined class="mr-4" color="grey darken-2" @click="openForm" v-show="type === 'category'">
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
          :interval-count="10"
          category-show-all
          :categories="categories"
          @click:event="showEvent"
          @click:more="viewDay"
          @click:date="viewDay"
          @change="updateRange"
        >
        </v-calendar>
        <v-menu
          v-model="newReserve"
          :close-on-content-click="false" 
          nudge-bottom="120" nudge-right="60"
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
                v-model="peple"
              ></v-select>
            </v-card-text>
            <v-card-actions>
              <v-btn color="green" dark class="ml-3 mb-3" @click="addEvent">予約</v-btn>
            </v-card-actions>
          </v-card>
        </v-menu>
        <v-menu
          v-model="selectedOpen"
          :close-on-content-click="false"
          :activator="selectedElement"
          offset-x
        >
          <v-card color="grey lighten-4" min-width="350px" flat>
            <v-toolbar :color="selectedEvent.color" dark>
              <v-toolbar-title>
                <span v-html="selectedEvent.status"></span>
              </v-toolbar-title>
              <v-spacer></v-spacer>
              <v-btn text color="green" @click="fixReservation(selectedEvent.id)" v-if="selectedEvent.status === '仮予約'">
                <v-icon>mdi-check</v-icon>
                <span>確定</span>
              </v-btn>
              <v-btn text color="lime" @click="resetReservation(selectedEvent.id)" v-else>
                <v-icon>mdi-restart</v-icon>
                <span>未確定</span>
              </v-btn>
              <v-btn text color="orange darken-1" @click="cancelReservation(selectedEvent.id)">
                <v-icon>mdi-close-circle-outline</v-icon>
                <span>キャンセル</span>
              </v-btn>
            </v-toolbar>
            <v-card-text v-if="selectedEvent.start">
              <div v-html="selectedEvent.name"></div>
              <span v-html="selectedEvent.start.getHours() + ':' + ('0' + selectedEvent.start.getMinutes()).slice(-2)"></span>
              <span>～</span>
              <span v-html="selectedEvent.end.getHours() + ':' + ('0' + selectedEvent.end.getMinutes()).slice(-2)"></span>
              <div v-html="selectedEvent.peple + ' 名様'"></div>
            </v-card-text>
          </v-card>
        </v-menu>
      </v-sheet>
    </v-col>
  </v-row>
</template>

<script>
import db from '../firebase/firestore';

export default {
  data: () => ({
    focus: "",
    type: "month",
    typeToLabel: {
      month: "月",
      week: "週",
      day: "日",
      category: "日",
    },
    selectedEvent: {},
    selectedElement: null,
    selectedOpen: false,
    newReserve: false,
    events: [],
    counts: [],
    colors: [
      "green",
    ],
    names: [
      "event",
    ],
    // 11:00~15:00 17:00~21:00
    intervals: ['11:00', '11:30', '12:00', '12:30', '13:00', '17:00', '17:30', '18:00', '18:30', '19:00'],
    name: '',
    mail: '',
    time: '',
    peple: '',
    categories: ['Aテーブル', 'Bテーブル', 'Cテーブル', 'Dテーブル', 'Eテーブル'],
  }),
  mounted() {
    this.$refs.calendar.checkChange();
  },
  methods: {
    viewDay({ date }) {
      const today = new Date();
      const target = new Date(date);
      if(today.getTime() > target.getTime()){
        alert('明日以降の日付を選択してください。');
      } else {
        this.focus = date;
        this.type = "category";//"day";
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
        return interval.time
    },
    openForm() {
      this.newReserve = true;
      // 予約数をカウント
      this.events.forEach(e => {
        if (this.focus === e.start.getFullYear() + '-' + ('0' + (e.start.getMonth() + 1)).slice(-2) + '-' + ('0' + e.start.getDate()).slice(-2)) {
          const time1 = e.start.getHours() + ':' + ('0' + e.end.getMinutes()).slice(-2);
          const time2 = (e.start.getHours() + 1) + ':' + ('0' + e.end.getMinutes()).slice(-2);
          this.counts[time1] = (this.counts[time1]) ? this.counts[time1] + 1 : 1;
          this.counts[time2] = (this.counts[time2]) ? this.counts[time2] + 1 : 1;
        }
      });
      for(let i = 0; i < this.intervals.length; i++) {
        // 満席時間はセレクトボックスから消す
        if (this.counts[this.intervals[i]] >= 2) this.intervals.splice(i, 1);
      }
    },
    addEvent() {
      /*let err = '';
      if (!this.name) err += 'お名前を入力してください。\n';
      if (!this.mail) err += 'メールアドレスを入力してください。\n';
      if (!this.time) err += '時刻を選んでください。\n';
      if (!this.peple) err += '人数を選んでください。\n';
      if (err) {
        alert(err);
        return;
      }*/
      // 予約の追加
      const first = new Date(this.focus + ' ' + this.time)
      const second = new Date(this.focus);
      second.setHours(first.getHours() + 2);
      const event = {
        name: this.name + ' 様',
        status: '仮予約',
        start: first,
        end: second,
        peple: this.peple,
        color: 'lime',
        timed: true
      };
      this.events.push(event);
      db.collection('reservations').add(event).then(() => {
        // メール送信
      });

      this.newReserve = false;
      this.name = '';
      this.mail = '';
      this.time = '';
      this.peple = '';
    },
    fixReservation(id) {
      // 予約の確定
      db.collection('reservations').doc(id).update({
        status: '予約',
        color: 'green'
      })
      .then(() => {
        this.selectedOpen = false;
        this.updateRange();
      });
    },
    resetReservation(id) {
      // 未確定に
      db.collection('reservations').doc(id).update({
        status: '仮予約',
        color: 'lime'
      })
      .then(() => {
        this.selectedOpen = false;
        this.updateRange();
      });
    },
    updateRange() {
      this.events = [];
      db.collection('reservations').get().then(snapshot => {
        snapshot.forEach(doc => {
          const data = doc.data();
          const event = {
            id: doc.id,
            category: data.category,
            name: data.name,
            status: data.status,
            start: new Date(data.start.toDate()),
            end: new Date(data.end.toDate()),
            peple: data.peple,
            color: data.color,
            timed: data.timed
          };
          this.events.push(event);
        })
      })
    }
  },
};
</script>