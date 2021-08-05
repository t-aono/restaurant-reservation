<template>
  <v-row class="fill-height">
    <v-col>
      <v-sheet height="64">
        <v-toolbar flat>
          <v-btn outlined class="mr-4" color="grey darken-2" @click="setToday">
            Today
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
          <v-btn outlined class="mr-4" color="grey darken-2" @click="openForm" v-show="type === 'day'">
            予約する
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
                <v-list-item-title>Week</v-list-item-title>
              </v-list-item>
              <v-list-item @click="type = 'month'">
                <v-list-item-title>Month</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </v-toolbar>
      </v-sheet>
      <v-sheet height="600">
        <v-calendar
          ref="calendar"
          v-model="focus"
          color="lime"  
          :events="events"
          :event-color="getEventColor"
          :type="type"
          :interval-format="intervalFormat"
          :first-time="intervals[0]"
          :interval-count="intervals.length / 2 + 2"
          @click:event="showEvent"
          @click:more="viewDay"
          @click:date="viewDay"
          @change="updateRange"
        ></v-calendar>
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
                <span v-html="selectedEvent.detail"></span>
              </v-toolbar-title>
              <v-spacer></v-spacer>
            </v-toolbar>
            <v-card-text>
              <span v-html="selectedEvent.name"></span>
            </v-card-text>
            <v-card-text>
              <span v-html="selectedEvent.start"></span>
            </v-card-text>
            <v-card-text>
              <span v-html="selectedEvent"></span>
            </v-card-text>
          </v-card>
        </v-menu>
      </v-sheet>
    </v-col>
  </v-row>
</template>

<script>
export default {
  data: () => ({
    focus: "",
    type: "month",
    typeToLabel: {
      month: "Month",
      week: "Week",
      day: "Day",
    },
    selectedEvent: {},
    selectedElement: null,
    selectedOpen: false,
    newReserve: false,
    events: [],
    colors: [
      "green",
    ],
    names: [
      "event",
    ],
    intervals: [],
    name: '',
    time: '',
    peple: '',
  }),
  mounted() {
    this.$refs.calendar.checkChange();
    for (let i = 22; i <= 40; i++) {  // 11:~20:00
      this.intervals.push(Math.floor(i / 2) + ":" +  ((i % 2 === 0) ? '00' : '30'))
    }
  },
  methods: {
    viewDay({ date }) {
      const today = new Date();
      const target = new Date(date);
      if(today.getTime() > target.getTime()){
        alert('明日以降の日付を選択してください。');
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
        return interval.time
    },
    openForm() {
      if (this.focus) {
        this.newReserve = true;
      } else {
        alert('日付を選択してください。');
      }
    },
    addEvent() {
      let err = '';
      if (!this.name) err += 'お名前を入力してください。\n';
      if (!this.time) err += '時刻を選んでください。\n';
      if (!this.peple) err += '人数を選んでください。\n';
      if (err) {
        alert(err);
        return;
      }
      // 予約の追加
      const first = new Date(this.focus + ' ' + this.time)
      const second = new Date(this.focus);
      second.setHours(first.getHours() + 2);
      this.events.push({
        name: this.name + ' 様',
        detail: '仮予約',
        start: first,
        end: second,
        color: 'lime',
        timed: true
      });
      this.newReserve = false;
      this.name = '';
      this.time = '';
      this.peple = '';
    },
    updateRange({ start, end }) {
      console.log(start, end)
    },
  },
};
</script>