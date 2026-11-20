/* ============================================================
   SPORTS ACADEMY MANAGEMENT SYSTEM
   ADMIN PORTAL — MAIN JAVASCRIPT

   File: admin/js/admin.js

   Features:
   - Independent admin-only localStorage
   - Sample demonstration records
   - Add / View / Edit / Delete
   - Search and filters
   - CSV export
   - Dashboard statistics
   - Form validation
   - Responsive sidebar

   Frontend prototype only. No backend or database.
   ============================================================ */

(function () {
  "use strict";

  /* ========================================================
       1. HELPERS
    ======================================================== */

  const $ = (id) => document.getElementById(id);

  const today = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const offsetDate = (days) => {
    const date = new Date();
    date.setDate(date.getDate() + days);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const escapeHTML = (value) => {
    return String(value ?? "").replace(
      /[&<>"']/g,
      (char) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[char],
    );
  };

  const numberValue = (value) => {
    const number = Number(value);
    return Number.isFinite(number) ? number : 0;
  };

  const money = (value) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(numberValue(value));
  };

  const formatDate = (value) => {
    if (!value) return "—";

    const date = new Date(value + "T00:00:00");

    if (Number.isNaN(date.getTime())) return escapeHTML(value);

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const titleCase = (value) => {
    return String(value || "")
      .replace(/[-_]/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  const makeId = () => {
    return (
      "REC-" +
      Date.now().toString(36).toUpperCase() +
      "-" +
      Math.random().toString(36).slice(2, 6).toUpperCase()
    );
  };

  const initials = (name) => {
    return String(name || "NA")
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase();
  };

  const unique = (values) => {
    return [...new Set(values.filter(Boolean))];
  };

  const safeRead = (key, fallback) => {
    try {
      const value = localStorage.getItem(key);

      if (value === null) {
        localStorage.setItem(key, JSON.stringify(fallback));
        return structuredClone(fallback);
      }

      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : structuredClone(fallback);
    } catch (error) {
      console.error("Could not read admin data:", key, error);
      return structuredClone(fallback);
    }
  };

  const safeWrite = (key, records) => {
    try {
      localStorage.setItem(key, JSON.stringify(records));
      return true;
    } catch (error) {
      console.error("Could not save admin data:", key, error);
      showToast(
        "Unable to save data. Browser storage may be full or unavailable.",
        "error",
      );
      return false;
    }
  };

  const getRecords = (config) => safeRead(config.key, config.seed);

  const saveRecords = (config, records) => safeWrite(config.key, records);

  /* ========================================================
       2. NOTIFICATIONS
    ======================================================== */

  function showToast(message, type) {
    let container = $("adminToastContainer");

    if (!container) {
      container = document.createElement("div");
      container.id = "adminToastContainer";
      container.className = "toast-container";
      container.setAttribute("aria-live", "polite");
      document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = "toast toast-" + (type || "success");
    toast.textContent = message;

    container.appendChild(toast);

    window.setTimeout(() => {
      toast.remove();
    }, 3500);
  }

  /* ========================================================
       3. DEMONSTRATION DATA
    ======================================================== */

  const SPORTS = [
    "Athletics",
    "Badminton",
    "Basketball",
    "Boxing Fitness",
    "Cricket",
    "Fitness",
    "Football",
    "Gymnastics",
    "Rugby",
    "Swimming",
    "Table Tennis",
    "Tennis",
    "Volleyball",
    "Yoga",
  ];

  const ATHLETE_SEED = [
    {
      id: "ATH-001",
      name: "Athlete1",
      username: "athlete1",
      email: "athlete1@example.com",
      age: 19,
      sport: "Football",
      course: "Football Advanced",
      status: "Active",
      joined: offsetDate(-180),
    },
    {
      id: "ATH-002",
      name: "Aarav Sharma",
      username: "aarav02",
      email: "aarav@example.com",
      age: 20,
      sport: "Cricket",
      course: "Cricket Intermediate",
      status: "Active",
      joined: offsetDate(-120),
    },
    {
      id: "ATH-003",
      name: "Priya Singh",
      username: "priya03",
      email: "priya@example.com",
      age: 18,
      sport: "Badminton",
      course: "Badminton Foundation",
      status: "Active",
      joined: offsetDate(-90),
    },
    {
      id: "ATH-004",
      name: "Rohan Verma",
      username: "rohan04",
      email: "rohan@example.com",
      age: 21,
      sport: "Athletics",
      course: "Athletics Performance",
      status: "Inactive",
      joined: offsetDate(-240),
    },
    {
      id: "ATH-005",
      name: "Meera Patel",
      username: "meera05",
      email: "meera@example.com",
      age: 19,
      sport: "Swimming",
      course: "Swimming Intermediate",
      status: "Active",
      joined: offsetDate(-60),
    },
  ];

  const COACH_SEED = [
    {
      id: "COA-001",
      name: "Rajesh Kumar",
      email: "rajesh@example.com",
      phone: "9876500001",
      sport: "Football",
      experience: 8,
      batch: "Morning Batch",
      status: "Active",
      joined: offsetDate(-500),
    },
    {
      id: "COA-002",
      name: "Anita Sharma",
      email: "anita@example.com",
      phone: "9876500002",
      sport: "Cricket",
      experience: 6,
      batch: "Evening Batch",
      status: "Active",
      joined: offsetDate(-350),
    },
    {
      id: "COA-003",
      name: "Vikram Singh",
      email: "vikram@example.com",
      phone: "9876500003",
      sport: "Badminton",
      experience: 5,
      batch: "Weekend Batch",
      status: "Active",
      joined: offsetDate(-220),
    },
    {
      id: "COA-004",
      name: "Neha Verma",
      email: "neha@example.com",
      phone: "9876500004",
      sport: "Swimming",
      experience: 4,
      batch: "Morning Batch",
      status: "Inactive",
      joined: offsetDate(-150),
    },
  ];

  const SPORT_SEED = [
    {
      id: "SPT-001",
      name: "Football",
      category: "Team Sport",
      coachCount: 2,
      maxParticipants: 30,
      status: "Active",
      facility: "Football Ground",
      description: "Football training and match preparation.",
    },
    {
      id: "SPT-002",
      name: "Cricket",
      category: "Team Sport",
      coachCount: 2,
      maxParticipants: 25,
      status: "Active",
      facility: "Cricket Ground",
      description: "Batting, bowling, fielding, and match practice.",
    },
    {
      id: "SPT-003",
      name: "Badminton",
      category: "Racquet Sport",
      coachCount: 1,
      maxParticipants: 16,
      status: "Active",
      facility: "Indoor Court",
      description: "Footwork, technique, and match practice.",
    },
    {
      id: "SPT-004",
      name: "Swimming",
      category: "Aquatic Sport",
      coachCount: 1,
      maxParticipants: 20,
      status: "Active",
      facility: "Swimming Pool",
      description: "Swimming technique and endurance training.",
    },
    {
      id: "SPT-005",
      name: "Athletics",
      category: "Track and Field",
      coachCount: 1,
      maxParticipants: 24,
      status: "Inactive",
      facility: "Running Track",
      description: "Track, field, speed, and endurance activities.",
    },
  ];

  const COURSE_SEED = [
    {
      id: "CRS-001",
      name: "Football Advanced",
      sport: "Football",
      level: "Advanced",
      coach: "Rajesh Kumar",
      duration: "12 Weeks",
      fee: 4500,
      capacity: 30,
      enrolled: 18,
      startDate: offsetDate(14),
      status: "Active",
      description: "Advanced football training and match tactics.",
    },
    {
      id: "CRS-002",
      name: "Cricket Intermediate",
      sport: "Cricket",
      level: "Intermediate",
      coach: "Anita Sharma",
      duration: "10 Weeks",
      fee: 3500,
      capacity: 25,
      enrolled: 15,
      startDate: offsetDate(7),
      status: "Active",
      description: "Batting, bowling, and fielding fundamentals.",
    },
    {
      id: "CRS-003",
      name: "Badminton Foundation",
      sport: "Badminton",
      level: "Beginner",
      coach: "Vikram Singh",
      duration: "8 Weeks",
      fee: 2500,
      capacity: 16,
      enrolled: 12,
      startDate: offsetDate(21),
      status: "Active",
      description: "Basic badminton techniques for beginners.",
    },
    {
      id: "CRS-004",
      name: "Swimming Intermediate",
      sport: "Swimming",
      level: "Intermediate",
      coach: "Neha Verma",
      duration: "8 Weeks",
      fee: 3000,
      capacity: 20,
      enrolled: 10,
      startDate: offsetDate(28),
      status: "Active",
      description: "Technique, breathing, and endurance.",
    },
    {
      id: "CRS-005",
      name: "Athletics Performance",
      sport: "Athletics",
      level: "Advanced",
      coach: "Rajesh Kumar",
      duration: "6 Weeks",
      fee: 2000,
      capacity: 24,
      enrolled: 0,
      startDate: offsetDate(-30),
      status: "Inactive",
      description: "Speed and track performance development.",
    },
  ];

  const SCHEDULE_SEED = [
    {
      id: "SCH-001",
      title: "Football Training",
      sport: "Football",
      course: "Football Advanced",
      coach: "Rajesh Kumar",
      date: offsetDate(1),
      day: "",
      startTime: "07:00",
      endTime: "08:30",
      venue: "Football Ground",
      capacity: 30,
      status: "Scheduled",
      notes: "Passing drills and team tactics.",
    },
    {
      id: "SCH-002",
      title: "Cricket Practice",
      sport: "Cricket",
      course: "Cricket Intermediate",
      coach: "Anita Sharma",
      date: offsetDate(2),
      day: "",
      startTime: "16:00",
      endTime: "17:30",
      venue: "Cricket Ground",
      capacity: 25,
      status: "Scheduled",
      notes: "Batting and bowling practice.",
    },
    {
      id: "SCH-003",
      title: "Badminton Skills",
      sport: "Badminton",
      course: "Badminton Foundation",
      coach: "Vikram Singh",
      date: offsetDate(3),
      day: "",
      startTime: "08:00",
      endTime: "09:00",
      venue: "Indoor Court",
      capacity: 16,
      status: "Scheduled",
      notes: "Footwork and racket control.",
    },
    {
      id: "SCH-004",
      title: "Swimming Practice",
      sport: "Swimming",
      course: "Swimming Intermediate",
      coach: "Neha Verma",
      date: offsetDate(-1),
      day: "",
      startTime: "06:30",
      endTime: "07:30",
      venue: "Swimming Pool",
      capacity: 20,
      status: "Completed",
      notes: "Endurance practice.",
    },
  ];

  const ATTENDANCE_SEED = [
    {
      id: "ATT-001",
      athlete: "Athlete1",
      athleteId: "ATH-001",
      sport: "Football",
      course: "Football Advanced",
      date: offsetDate(0),
      time: "07:00",
      status: "Present",
      coach: "Rajesh Kumar",
      remarks: "Participated in the full session.",
    },
    {
      id: "ATT-002",
      athlete: "Aarav Sharma",
      athleteId: "ATH-002",
      sport: "Cricket",
      course: "Cricket Intermediate",
      date: offsetDate(0),
      time: "16:00",
      status: "Present",
      coach: "Anita Sharma",
      remarks: "On time.",
    },
    {
      id: "ATT-003",
      athlete: "Priya Singh",
      athleteId: "ATH-003",
      sport: "Badminton",
      course: "Badminton Foundation",
      date: offsetDate(-1),
      time: "08:00",
      status: "Absent",
      coach: "Vikram Singh",
      remarks: "Not present.",
    },
    {
      id: "ATT-004",
      athlete: "Meera Patel",
      athleteId: "ATH-005",
      sport: "Swimming",
      course: "Swimming Intermediate",
      date: offsetDate(-1),
      time: "06:30",
      status: "Late",
      coach: "Neha Verma",
      remarks: "Arrived late.",
    },
    {
      id: "ATT-005",
      athlete: "Rohan Verma",
      athleteId: "ATH-004",
      sport: "Athletics",
      course: "Athletics Performance",
      date: offsetDate(-2),
      time: "07:00",
      status: "Excused",
      coach: "Rajesh Kumar",
      remarks: "Excused absence.",
    },
  ];

  const EVENT_SEED = [
    {
      id: "EVT-001",
      name: "Inter-Academy Football Cup",
      type: "Tournament",
      sport: "Football",
      date: offsetDate(14),
      startTime: "09:00",
      endDate: offsetDate(15),
      venue: "Main Football Ground",
      capacity: 120,
      registrations: 64,
      status: "Upcoming",
      organiser: "Rajesh Kumar",
      entryFee: 200,
      description: "Football tournament for academy athletes.",
    },
    {
      id: "EVT-002",
      name: "Annual Fitness Challenge",
      type: "Competition",
      sport: "Fitness",
      date: offsetDate(21),
      startTime: "08:00",
      endDate: offsetDate(21),
      venue: "Fitness Centre",
      capacity: 80,
      registrations: 42,
      status: "Upcoming",
      organiser: "Anita Sharma",
      entryFee: 100,
      description: "Fitness activities and endurance challenges.",
    },
    {
      id: "EVT-003",
      name: "Badminton Friendly",
      type: "Friendly Match",
      sport: "Badminton",
      date: offsetDate(-14),
      startTime: "10:00",
      endDate: offsetDate(-14),
      venue: "Indoor Court",
      capacity: 32,
      registrations: 24,
      status: "Completed",
      organiser: "Vikram Singh",
      entryFee: 0,
      description: "Friendly matches between academy groups.",
    },
  ];

  const PERFORMANCE_SEED = [
    {
      id: "PER-001",
      athlete: "Athlete1",
      athleteId: "ATH-001",
      sport: "Football",
      assessment: "Skill Assessment",
      date: offsetDate(-2),
      score: 91,
      coach: "Rajesh Kumar",
      rating: "Excellent",
      remarks: "Strong passing and positioning.",
    },
    {
      id: "PER-002",
      athlete: "Aarav Sharma",
      athleteId: "ATH-002",
      sport: "Cricket",
      assessment: "Fitness Test",
      date: offsetDate(-4),
      score: 78,
      coach: "Anita Sharma",
      rating: "Good",
      remarks: "Good stamina; continue agility training.",
    },
    {
      id: "PER-003",
      athlete: "Priya Singh",
      athleteId: "ATH-003",
      sport: "Badminton",
      assessment: "Speed Test",
      date: offsetDate(-5),
      score: 86,
      coach: "Vikram Singh",
      rating: "Excellent",
      remarks: "Very good court movement.",
    },
    {
      id: "PER-004",
      athlete: "Meera Patel",
      athleteId: "ATH-005",
      sport: "Swimming",
      assessment: "Endurance Test",
      date: offsetDate(-7),
      score: 68,
      coach: "Neha Verma",
      rating: "Average",
      remarks: "Focus on consistent pacing.",
    },
    {
      id: "PER-005",
      athlete: "Rohan Verma",
      athleteId: "ATH-004",
      sport: "Athletics",
      assessment: "Speed Test",
      date: offsetDate(-9),
      score: 54,
      coach: "Rajesh Kumar",
      rating: "Needs Improvement",
      remarks: "Additional technique practice recommended.",
    },
  ];

  /* ========================================================
       4. MODULE CONFIGURATION
    ======================================================== */

  const CONFIG = {
    athletes: {
      key: "sams_admin_athletes_v1",
      seed: ATHLETE_SEED,
      table: "athleteTableBody",
      search: "athleteSearch",
      filters: [
        { id: "sportFilter", prop: "sport" },
        { id: "statusFilter", prop: "status" },
      ],
      reset: "resetAthleteFilters",
      export: "exportAthletesBtn",
      count: "athleteResultCount",
      add: "addAthleteBtn",
      modal: "athleteModal",
      form: "athleteForm",
      recordId: "athleteRecordId",
      close: "closeAthleteModal",
      cancel: "cancelAthleteForm",
      error: "athleteFormError",
      save: "saveAthleteBtn",
      modalTitle: "athleteModalTitle",
      fields: [
        { id: "athleteName", prop: "name", label: "Athlete" },
        { id: "athleteUsername", prop: "username", label: "Username" },
        { id: "athleteEmail", prop: "email", label: "Email" },
        { id: "athleteAge", prop: "age", label: "Age", number: true },
        { id: "athleteSport", prop: "sport", label: "Sport" },
        { id: "athleteCourse", prop: "course", label: "Course" },
        { id: "athleteStatus", prop: "status", label: "Status" },
        { id: "athleteJoined", prop: "joined", label: "Joined" },
      ],
      columns: [
        { label: "Athlete", prop: "name", person: true, sub: "email" },
        { label: "Athlete ID", prop: "id" },
        { label: "Sport", prop: "sport" },
        { label: "Course", prop: "course" },
        { label: "Age", prop: "age" },
        { label: "Joined", prop: "joined", date: true },
        { label: "Status", prop: "status", badge: true },
      ],
    },

    coaches: {
      key: "sams_admin_coaches_v1",
      seed: COACH_SEED,
      table: "coachTableBody",
      search: "coachSearch",
      filters: [
        { id: "coachSportFilter", prop: "sport" },
        { id: "coachStatusFilter", prop: "status" },
      ],
      reset: "resetCoachFilters",
      export: "exportCoachesBtn",
      count: "coachResultCount",
      add: "addCoachBtn",
      modal: "coachModal",
      form: "coachForm",
      recordId: "coachRecordId",
      close: "closeCoachModal",
      cancel: "cancelCoachForm",
      error: "coachFormError",
      save: "saveCoachBtn",
      modalTitle: "coachModalTitle",
      fields: [
        { id: "coachName", prop: "name", label: "Coach" },
        { id: "coachEmail", prop: "email", label: "Email" },
        { id: "coachPhone", prop: "phone", label: "Phone" },
        { id: "coachSport", prop: "sport", label: "Sport" },
        {
          id: "coachExperienceInput",
          prop: "experience",
          label: "Experience",
          number: true,
        },
        { id: "coachBatch", prop: "batch", label: "Batch" },
        { id: "coachStatus", prop: "status", label: "Status" },
        { id: "coachJoined", prop: "joined", label: "Joined" },
      ],
      columns: [
        { label: "Coach", prop: "name", person: true, sub: "email" },
        { label: "Coach ID", prop: "id" },
        { label: "Sport", prop: "sport" },
        { label: "Phone", prop: "phone" },
        { label: "Experience", prop: "experience", suffix: " years" },
        { label: "Batch", prop: "batch" },
        { label: "Status", prop: "status", badge: true },
      ],
    },

    sports: {
      key: "sams_admin_sports_v1",
      seed: SPORT_SEED,
      table: "sportTableBody",
      search: "sportSearch",
      filters: [
        { id: "sportCategoryFilter", prop: "category" },
        { id: "sportStatusFilter", prop: "status" },
      ],
      reset: "resetSportFilters",
      export: "exportSportsBtn",
      count: "sportResultCount",
      add: "addSportBtn",
      modal: "sportModal",
      form: "sportForm",
      recordId: "sportRecordId",
      close: "closeSportModal",
      cancel: "cancelSportForm",
      error: "sportFormError",
      save: "saveSportBtn",
      modalTitle: "sportModalTitle",
      fields: [
        { id: "sportName", prop: "name", label: "Sport" },
        { id: "sportCategory", prop: "category", label: "Category" },
        {
          id: "sportCoachCount",
          prop: "coachCount",
          label: "Coaches",
          number: true,
        },
        {
          id: "sportMaxParticipants",
          prop: "maxParticipants",
          label: "Maximum Participants",
          number: true,
        },
        { id: "sportStatus", prop: "status", label: "Status" },
        { id: "sportFacility", prop: "facility", label: "Facility" },
        { id: "sportDescription", prop: "description", label: "Description" },
      ],
      columns: [
        { label: "Sport", prop: "name", person: true, sub: "facility" },
        { label: "Sport ID", prop: "id" },
        { label: "Category", prop: "category" },
        { label: "Coaches", prop: "coachCount" },
        { label: "Max Participants", prop: "maxParticipants" },
        { label: "Status", prop: "status", badge: true },
      ],
    },

    courses: {
      key: "sams_admin_courses_v1",
      seed: COURSE_SEED,
      table: "courseTableBody",
      search: "courseSearch",
      filters: [
        { id: "courseSportFilter", prop: "sport" },
        { id: "courseLevelFilter", prop: "level" },
        { id: "courseStatusFilter", prop: "status" },
      ],
      reset: "resetCourseFilters",
      export: "exportCoursesBtn",
      count: "courseResultCount",
      add: "addCourseBtn",
      modal: "courseModal",
      form: "courseForm",
      recordId: "courseRecordId",
      close: "closeCourseModal",
      cancel: "cancelCourseForm",
      error: "courseFormError",
      save: "saveCourseBtn",
      modalTitle: "courseModalTitle",
      fields: [
        { id: "courseName", prop: "name", label: "Course" },
        { id: "courseSport", prop: "sport", label: "Sport" },
        { id: "courseLevel", prop: "level", label: "Level" },
        { id: "courseCoach", prop: "coach", label: "Coach" },
        { id: "courseDuration", prop: "duration", label: "Duration" },
        { id: "courseFee", prop: "fee", label: "Fee", number: true },
        {
          id: "courseCapacity",
          prop: "capacity",
          label: "Capacity",
          number: true,
        },
        {
          id: "courseEnrolled",
          prop: "enrolled",
          label: "Enrolled",
          number: true,
        },
        { id: "courseStartDate", prop: "startDate", label: "Start Date" },
        { id: "courseStatus", prop: "status", label: "Status" },
        { id: "courseDescription", prop: "description", label: "Description" },
      ],
      columns: [
        { label: "Course", prop: "name", person: true, sub: "duration" },
        { label: "Course ID", prop: "id" },
        { label: "Sport", prop: "sport" },
        { label: "Level", prop: "level" },
        { label: "Coach", prop: "coach" },
        { label: "Fee", prop: "fee", money: true },
        { label: "Enrolment", prop: "enrolled", capacity: "capacity" },
        { label: "Status", prop: "status", badge: true },
      ],
    },

    schedule: {
      key: "sams_admin_schedule_v1",
      seed: SCHEDULE_SEED,
      table: "scheduleTableBody",
      search: "scheduleSearch",
      filters: [
        { id: "scheduleSportFilter", prop: "sport" },
        { id: "scheduleDayFilter", prop: "day" },
        { id: "scheduleStatusFilter", prop: "status" },
      ],
      reset: "resetScheduleFilters",
      export: "exportScheduleBtn",
      count: "scheduleResultCount",
      add: "addScheduleBtn",
      modal: "scheduleModal",
      form: "scheduleForm",
      recordId: "scheduleRecordId",
      close: "closeScheduleModal",
      cancel: "cancelScheduleForm",
      error: "scheduleFormError",
      save: "saveScheduleBtn",
      modalTitle: "scheduleModalTitle",
      fields: [
        { id: "scheduleTitle", prop: "title", label: "Session Title" },
        { id: "scheduleSport", prop: "sport", label: "Sport" },
        { id: "scheduleCourse", prop: "course", label: "Course" },
        { id: "scheduleCoach", prop: "coach", label: "Coach" },
        { id: "scheduleDate", prop: "date", label: "Date" },
        { id: "scheduleDay", prop: "day", label: "Day" },
        { id: "scheduleStartTime", prop: "startTime", label: "Start Time" },
        { id: "scheduleEndTime", prop: "endTime", label: "End Time" },
        { id: "scheduleVenue", prop: "venue", label: "Venue" },
        {
          id: "scheduleCapacity",
          prop: "capacity",
          label: "Capacity",
          number: true,
        },
        { id: "scheduleStatus", prop: "status", label: "Status" },
        { id: "scheduleNotes", prop: "notes", label: "Notes" },
      ],
      columns: [
        { label: "Session", prop: "title", person: true, sub: "course" },
        { label: "Schedule ID", prop: "id" },
        { label: "Sport", prop: "sport" },
        { label: "Coach", prop: "coach" },
        { label: "Date", prop: "date", date: true },
        { label: "Time", prop: "startTime", timeRange: "endTime" },
        { label: "Venue", prop: "venue" },
        { label: "Status", prop: "status", badge: true },
      ],
    },

    attendance: {
      key: "sams_admin_attendance_v1",
      seed: ATTENDANCE_SEED,
      table: "attendanceTableBody",
      search: "attendanceSearch",
      filters: [
        { id: "attendanceDateFilter", prop: "date" },
        { id: "attendanceSportFilter", prop: "sport" },
        { id: "attendanceStatusFilter", prop: "status" },
      ],
      reset: "resetAttendanceFilters",
      export: "exportAttendanceBtn",
      count: "attendanceResultCount",
      add: "addAttendanceBtn",
      modal: "attendanceModal",
      form: "attendanceForm",
      recordId: "attendanceRecordId",
      close: "closeAttendanceModal",
      cancel: "cancelAttendanceForm",
      error: "attendanceFormError",
      save: "saveAttendanceBtn",
      modalTitle: "attendanceModalTitle",
      fields: [
        { id: "attendanceAthlete", prop: "athlete", label: "Athlete" },
        { id: "attendanceAthleteId", prop: "athleteId", label: "Athlete ID" },
        { id: "attendanceSport", prop: "sport", label: "Sport" },
        { id: "attendanceCourse", prop: "course", label: "Course" },
        { id: "attendanceDate", prop: "date", label: "Date" },
        { id: "attendanceTime", prop: "time", label: "Time" },
        { id: "attendanceStatus", prop: "status", label: "Attendance Status" },
        { id: "attendanceCoach", prop: "coach", label: "Coach" },
        { id: "attendanceRemarks", prop: "remarks", label: "Remarks" },
      ],
      columns: [
        { label: "Athlete", prop: "athlete", person: true, sub: "athleteId" },
        { label: "Sport", prop: "sport" },
        { label: "Course", prop: "course" },
        { label: "Date", prop: "date", date: true },
        { label: "Time", prop: "time" },
        { label: "Coach", prop: "coach" },
        { label: "Status", prop: "status", badge: true },
      ],
    },

    events: {
      key: "sams_admin_events_v1",
      seed: EVENT_SEED,
      table: "eventTableBody",
      search: "eventSearch",
      filters: [
        { id: "eventTypeFilter", prop: "type" },
        { id: "eventSportFilter", prop: "sport" },
        { id: "eventStatusFilter", prop: "status" },
      ],
      reset: "resetEventFilters",
      export: "exportEventsBtn",
      count: "eventResultCount",
      add: "addEventBtn",
      modal: "eventModal",
      form: "eventForm",
      recordId: "eventRecordId",
      close: "closeEventModal",
      cancel: "cancelEventForm",
      error: "eventFormError",
      save: "saveEventBtn",
      modalTitle: "eventModalTitle",
      fields: [
        { id: "eventName", prop: "name", label: "Event Name" },
        { id: "eventType", prop: "type", label: "Event Type" },
        { id: "eventSport", prop: "sport", label: "Sport" },
        { id: "eventDate", prop: "date", label: "Start Date" },
        { id: "eventStartTime", prop: "startTime", label: "Start Time" },
        { id: "eventEndDate", prop: "endDate", label: "End Date" },
        { id: "eventVenue", prop: "venue", label: "Venue" },
        {
          id: "eventCapacity",
          prop: "capacity",
          label: "Capacity",
          number: true,
        },
        {
          id: "eventRegistrationsInput",
          prop: "registrations",
          label: "Registrations",
          number: true,
        },
        { id: "eventStatus", prop: "status", label: "Status" },
        { id: "eventOrganiser", prop: "organiser", label: "Organiser" },
        {
          id: "eventEntryFee",
          prop: "entryFee",
          label: "Entry Fee",
          number: true,
        },
        { id: "eventDescription", prop: "description", label: "Description" },
      ],
      columns: [
        { label: "Event", prop: "name", person: true, sub: "venue" },
        { label: "Event ID", prop: "id" },
        { label: "Type", prop: "type" },
        { label: "Sport", prop: "sport" },
        { label: "Date", prop: "date", date: true },
        { label: "Registrations", prop: "registrations", capacity: "capacity" },
        { label: "Entry Fee", prop: "entryFee", money: true },
        { label: "Status", prop: "status", badge: true },
      ],
    },

    performance: {
      key: "sams_admin_performance_v1",
      seed: PERFORMANCE_SEED,
      table: "performanceTableBody",
      search: "performanceSearch",
      filters: [
        { id: "performanceSportFilter", prop: "sport" },
        { id: "performanceRatingFilter", prop: "rating" },
        { id: "performanceDateFilter", prop: "date" },
      ],
      reset: "resetPerformanceFilters",
      export: "exportPerformanceBtn",
      count: "performanceResultCount",
      add: "addPerformanceBtn",
      modal: "performanceModal",
      form: "performanceForm",
      recordId: "performanceRecordId",
      close: "closePerformanceModal",
      cancel: "cancelPerformanceForm",
      error: "performanceFormError",
      save: "savePerformanceBtn",
      modalTitle: "performanceModalTitle",
      fields: [
        { id: "performanceAthlete", prop: "athlete", label: "Athlete" },
        { id: "performanceAthleteId", prop: "athleteId", label: "Athlete ID" },
        { id: "performanceSport", prop: "sport", label: "Sport" },
        {
          id: "performanceAssessment",
          prop: "assessment",
          label: "Assessment",
        },
        { id: "performanceDate", prop: "date", label: "Date" },
        { id: "performanceScore", prop: "score", label: "Score", number: true },
        { id: "performanceCoach", prop: "coach", label: "Coach" },
        { id: "performanceRating", prop: "rating", label: "Rating" },
        { id: "performanceRemarks", prop: "remarks", label: "Remarks" },
      ],
      columns: [
        { label: "Athlete", prop: "athlete", person: true, sub: "athleteId" },
        { label: "Athlete ID", prop: "athleteId" },
        { label: "Sport", prop: "sport" },
        { label: "Assessment", prop: "assessment" },
        { label: "Date", prop: "date", date: true },
        { label: "Score", prop: "score", percent: true },
        { label: "Rating", prop: "rating", rating: true },
        { label: "Coach", prop: "coach" },
      ],
    },
  };

  /* ========================================================
       5. MODULE HELPERS
    ======================================================== */

  function getModuleFromPage() {
    const file = window.location.pathname.split("/").pop().toLowerCase();

    const map = {
      "athletes.html": "athletes",
      "coaches.html": "coaches",
      "sports.html": "sports",
      "courses.html": "courses",
      "schedule.html": "schedule",
      "attendance.html": "attendance",
      "events.html": "events",
      "performance.html": "performance",
    };

    return map[file] || null;
  }

  function ratingFromScore(score) {
    const value = numberValue(score);

    if (value >= 85) return "Excellent";
    if (value >= 70) return "Good";
    if (value >= 55) return "Average";

    return "Needs Improvement";
  }

  function calculateDay(date) {
    if (!date) return "";

    const parsed = new Date(date + "T00:00:00");

    if (Number.isNaN(parsed.getTime())) return "";

    return parsed.toLocaleDateString("en-US", { weekday: "long" });
  }

  function normalizeRecord(config, record) {
    const result = { ...record };

    if (!result.id) result.id = makeId();

    if (config === CONFIG.schedule && result.date) {
      result.day = calculateDay(result.date);
    }

    if (config === CONFIG.performance && result.score !== undefined) {
      result.rating = result.rating || ratingFromScore(result.score);
    }

    return result;
  }

  function filteredRecords(config) {
    let records = getRecords(config);

    const searchInput = $(config.search);
    const query = searchInput ? searchInput.value.trim().toLowerCase() : "";

    if (query) {
      records = records.filter((record) => {
        const text = Object.values(record).join(" ").toLowerCase();
        return text.includes(query);
      });
    }

    config.filters.forEach((filter) => {
      const input = $(filter.id);
      if (!input || !input.value) return;

      records = records.filter((record) => {
        return String(record[filter.prop] ?? "") === input.value;
      });
    });

    return records;
  }

  function badgeClass(value) {
    const normalized = String(value || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    if (normalized === "active") return "status-active";
    if (normalized === "inactive") return "status-inactive";
    if (normalized === "present") return "status-present";
    if (normalized === "absent") return "status-absent";
    if (normalized === "late") return "status-pending";
    if (normalized === "excused") return "status-neutral";
    if (normalized === "completed") return "status-completed";
    if (normalized === "cancelled") return "status-cancelled";
    if (normalized === "upcoming") return "status-upcoming";
    if (normalized === "scheduled") return "status-scheduled";
    if (normalized === "pending") return "status-pending";
    if (normalized === "excellent") return "rating-excellent";
    if (normalized === "good") return "rating-good";
    if (normalized === "average") return "rating-average";
    if (normalized === "needs-improvement") return "rating-needs-improvement";

    return "status-neutral";
  }

  function renderCell(record, column) {
    const value = record[column.prop];

        if (column.person) {
      const name = escapeHTML(value || "—");
      const sub = column.sub ? escapeHTML(record[column.sub] || "") : "";

      return `
        <div class="table-person">
          <div class="table-person-avatar">${escapeHTML(initials(value))}</div>
          <div>
            <strong>${name}</strong>${sub ? `<small>${sub}</small>` : ""}
          </div>
        </div>`;
    }
    if (column.badge || column.rating) {
      const safeValue = escapeHTML(value || "—");
      const badgeType = column.rating ? "rating-badge" : "status-badge";

      return `<span class="${badgeType} ${badgeClass(value)}">${safeValue}</span>`;
    }
    if (column.date) {
      return escapeHTML(formatDate(value));
    }

    if (column.money) {
      return escapeHTML(money(value));
    }

    if (column.percent) {
      const score = numberValue(value);
      return `
                <div class="progress-wrapper">
                    <div class="progress-label">
                        <strong>${escapeHTML(score)}%</strong>
                    </div>
                    <div class="progress-track">
                        <div class="progress-fill" style="width:${Math.max(0, Math.min(100, score))}%"></div>
                    </div>
                </div>
            `;
    }

    if (column.capacity) {
      return `${escapeHTML(value ?? 0)} / ${escapeHTML(record[column.capacity] ?? 0)}`;
    }

    if (column.timeRange) {
      return `${escapeHTML(value || "—")} – ${escapeHTML(record[column.timeRange] || "—")}`;
    }

    if (column.suffix) {
      return `${escapeHTML(value ?? 0)}${escapeHTML(column.suffix)}`;
    }

    return escapeHTML(value ?? "—");
  }

  function renderTable(config, moduleName) {
    const body = $(config.table);
    if (!body) return;

    const records = filteredRecords(config);

    if (!records.length) {
      body.innerHTML = `
                <tr>
                    <td colspan="${config.columns.length + 1}" class="empty-state">
                        No records found. Try changing your search or filters.
                    </td>
                </tr>
            `;
    } else {
      body.innerHTML = records
        .map((record) => {
          const cells = config.columns
            .map((column) => {
              return `<td>${renderCell(record, column)}</td>`;
            })
            .join("");

          return `
                    <tr data-record-id="${escapeHTML(record.id)}">
                        ${cells}
                        <td>
                            <div class="table-actions">
                                <button type="button" class="btn-icon"
                                    data-action="view" data-id="${escapeHTML(record.id)}"
                                    aria-label="View record" title="View">⌕</button>
                                <button type="button" class="btn-icon"
                                    data-action="edit" data-id="${escapeHTML(record.id)}"
                                    aria-label="Edit record" title="Edit">✎</button>
                                <button type="button" class="btn-icon danger"
                                    data-action="delete" data-id="${escapeHTML(record.id)}"
                                    aria-label="Delete record" title="Delete">×</button>
                            </div>
                        </td>
                    </tr>
                `;
        })
        .join("");
    }

    const count = $(config.count);

    if (count) {
      count.textContent = `Showing ${records.length} of ${getRecords(config).length} records`;
    }

    updateModuleStats(moduleName, getRecords(config));
  }

  /* ========================================================
       6. UPDATE MODULE STATISTICS
    ======================================================== */

  function setText(id, value) {
    const element = $(id);
    if (element) element.textContent = value;
  }

  function updateModuleStats(moduleName, records) {
    const active = records.filter((record) => record.status === "Active");

    if (moduleName === "athletes") {
      setText("athleteTotal", records.length);
      setText("athleteActive", active.length);
      setText(
        "athleteSports",
        unique(records.map((record) => record.sport)).length,
      );
      setText(
        "athleteEnrolments",
        records.filter((record) => record.course).length,
      );
    }

    if (moduleName === "coaches") {
      setText("coachTotal", records.length);
      setText("coachActive", active.length);
      setText(
        "coachSports",
        unique(records.map((record) => record.sport)).length,
      );

      const experience = records.length
        ? records.reduce(
            (sum, record) => sum + numberValue(record.experience),
            0,
          ) / records.length
        : 0;

      setText("coachExperience", experience.toFixed(1) + " yrs");
    }

    if (moduleName === "sports") {
      setText("sportTotal", records.length);
      setText("sportActive", active.length);

      const athletes = getRecords(CONFIG.athletes);
      const enrolments = athletes.filter((athlete) =>
        records.some((sport) => sport.name === athlete.sport),
      ).length;

      setText("sportEnrolments", enrolments);
      setText(
        "sportCategories",
        unique(records.map((record) => record.category)).length,
      );
    }

    if (moduleName === "courses") {
      setText("courseTotal", records.length);
      setText("courseActive", active.length);

      const averageFee = records.length
        ? records.reduce((sum, record) => sum + numberValue(record.fee), 0) /
          records.length
        : 0;

      setText("courseAverageFee", money(averageFee));
      setText(
        "courseEnrolments",
        records.reduce((sum, record) => sum + numberValue(record.enrolled), 0),
      );
    }

    if (moduleName === "schedule") {
      const upcoming = records.filter(
        (record) =>
          record.date >= today() &&
          record.status !== "Cancelled" &&
          record.status !== "Completed",
      );

      setText("scheduleTotal", records.length);
      setText("scheduleUpcoming", upcoming.length);
      setText(
        "scheduleCoaches",
        unique(records.map((record) => record.coach)).length,
      );
      setText(
        "scheduleVenues",
        unique(records.map((record) => record.venue)).length,
      );
    }

    if (moduleName === "attendance") {
      const present = records.filter(
        (record) => record.status === "Present",
      ).length;
      const absent = records.filter(
        (record) => record.status === "Absent",
      ).length;
      const rate = records.length ? (present / records.length) * 100 : 0;

      setText("attendanceTotal", records.length);
      setText("attendancePresent", present);
      setText("attendanceAbsent", absent);
      setText("attendanceRate", rate.toFixed(1) + "%");
    }

    if (moduleName === "events") {
      const upcoming = records.filter(
        (record) =>
          record.date >= today() &&
          record.status !== "Cancelled" &&
          record.status !== "Completed",
      );

      const registrations = records.reduce(
        (sum, record) => sum + numberValue(record.registrations),
        0,
      );

      const completed = records.filter(
        (record) => record.status === "Completed",
      ).length;

      setText("eventTotal", records.length);
      setText("eventUpcoming", upcoming.length);
      setText("eventRegistrations", registrations);
      setText("eventCompleted", completed);
    }

    if (moduleName === "performance") {
      const athletes = unique(
        records.map((record) => record.athleteId || record.athlete),
      );
      const average = records.length
        ? records.reduce((sum, record) => sum + numberValue(record.score), 0) /
          records.length
        : 0;

      const excellent = records.filter(
        (record) => numberValue(record.score) >= 85,
      ).length;

      setText("performanceTotal", records.length);
      setText("performanceAthletes", athletes.length);
      setText("performanceAverage", average.toFixed(1) + "%");
      setText("performanceExcellent", excellent);
    }
  }

  /* ========================================================
       7. REFRESH FILTER OPTIONS
    ======================================================== */

  function refreshFilterOptions(config) {
    config.filters.forEach((filter) => {
      const select = $(filter.id);
      if (!select || select.tagName !== "SELECT") return;

      const selected = select.value;
      const records = getRecords(config);
      const values = unique(
        records.map((record) => record[filter.prop]),
      ).sort();

      const originalFirst = select.options[0];
      const firstText = originalFirst ? originalFirst.textContent : "All";

      select.innerHTML = "";

      const defaultOption = document.createElement("option");
      defaultOption.value = "";
      defaultOption.textContent = firstText;
      select.appendChild(defaultOption);

      values.forEach((value) => {
        const option = document.createElement("option");
        option.value = value;
        option.textContent = value;
        select.appendChild(option);
      });

      if (values.includes(selected)) select.value = selected;
    });
  }

  /* ========================================================
       8. MODAL HELPERS
    ======================================================== */

  function setFormError(config, message) {
    const element = $(config.error);
    if (element) element.textContent = message || "";
  }

  function closeModal(config) {
    const modal = $(config.modal);
    if (!modal) return;

    modal.hidden = true;
    document.body.style.overflow = "";
    setFormError(config, "");
  }

  function openModal(config, moduleName, record) {
    const modal = $(config.modal);
    const form = $(config.form);

    if (!modal || !form) {
      showToast("The form is not available on this page.", "error");
      return;
    }

    form.reset();
    setFormError(config, "");

    const recordId = $(config.recordId);
    if (recordId) recordId.value = record ? record.id : "";

    config.fields.forEach((field) => {
      const input = $(field.id);
      if (!input) return;

      if (record) {
        input.value = record[field.prop] ?? "";
      } else {
        input.value = "";
      }
    });

    const title = $(config.modalTitle);

    if (title) {
      title.textContent = record
        ? "Edit " + moduleName.slice(0, -1)
        : "Add " + moduleName.slice(0, -1);
    }

    const saveButton = $(config.save);

    if (saveButton) {
      saveButton.textContent = record ? "Save Changes" : "Save Record";
    }

    modal.hidden = false;
    document.body.style.overflow = "hidden";

    const firstInput = config.fields
      .map((field) => $(field.id))
      .find((input) => input && !input.disabled);

    if (firstInput) {
      window.setTimeout(() => firstInput.focus(), 50);
    }
  }

  function validateRecord(config, record) {
    for (const field of config.fields) {
      const input = $(field.id);

      if (!input) continue;

      if (input.required && !String(input.value).trim()) {
        return `${field.label} is required.`;
      }

      if (input.type === "email" && input.value.trim()) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(input.value.trim())) {
          return "Please enter a valid email address.";
        }
      }
    }

    if (CONFIG.performance === config) {
      const score = numberValue(record.score);

      if (score < 0 || score > 100) {
        return "Performance score must be between 0 and 100.";
      }

      record.rating = record.rating || ratingFromScore(score);
    }

    if (CONFIG.courses === config) {
      if (numberValue(record.fee) < 0) return "Course fee cannot be negative.";
      if (numberValue(record.capacity) < 0)
        return "Course capacity cannot be negative.";
      if (numberValue(record.enrolled) < 0)
        return "Enrolment cannot be negative.";

      if (numberValue(record.enrolled) > numberValue(record.capacity)) {
        return "Enrolment cannot exceed course capacity.";
      }
    }

    if (CONFIG.events === config) {
      if (numberValue(record.capacity) < 0)
        return "Event capacity cannot be negative.";
      if (numberValue(record.registrations) < 0)
        return "Registrations cannot be negative.";

      if (numberValue(record.registrations) > numberValue(record.capacity)) {
        return "Registrations cannot exceed event capacity.";
      }

      if (record.endDate && record.date && record.endDate < record.date) {
        return "Event end date cannot be before its start date.";
      }
    }

    if (CONFIG.schedule === config) {
      if (
        record.startTime &&
        record.endTime &&
        record.endTime <= record.startTime
      ) {
        return "End time must be later than start time.";
      }
    }

    if (CONFIG.attendance === config) {
      if (!record.athlete.trim()) return "Athlete name is required.";
    }

    if (CONFIG.sports === config) {
      const records = getRecords(config);
      const duplicate = records.some(
        (item) =>
          item.name.toLowerCase() === String(record.name).toLowerCase() &&
          item.id !== record.id,
      );

      if (duplicate) return "A sport with this name already exists.";
    }

    return "";
  }

  function readFormRecord(config) {
    const record = {};

    const currentId = $(config.recordId);
    record.id = currentId && currentId.value ? currentId.value : makeId();

    config.fields.forEach((field) => {
      const input = $(field.id);
      if (!input) return;

      const value = input.value.trim();

      if (field.number) {
        record[field.prop] = value === "" ? 0 : Number(value);
      } else {
        record[field.prop] = value;
      }
    });

    return normalizeRecord(config, record);
  }

  /* ========================================================
       9. CRUD OPERATIONS
    ======================================================== */

  function viewRecord(config, record) {
    if (!record) return;

    const lines = Object.entries(record).map(([key, value]) => {
      let display = value ?? "—";

      if (key.toLowerCase().includes("date") || key === "joined") {
        display = value ? formatDate(value) : "—";
      }

      if (key === "fee" || key === "entryFee") {
        display = money(value);
      }

      return `${titleCase(key)}: ${display}`;
    });

    window.alert(lines.join("\n"));
  }

  function deleteRecord(config, moduleName, record) {
    if (!record) return;

    const displayName =
      record.name || record.title || record.athlete || record.id;

    const confirmed = window.confirm(
      `Delete "${displayName}"?\n\nThis action cannot be undone.`,
    );

    if (!confirmed) return;

    const records = getRecords(config).filter((item) => item.id !== record.id);

    if (!saveRecords(config, records)) return;

    refreshFilterOptions(config);
    renderTable(config, moduleName);
    updateDashboard();

    showToast("Record deleted successfully.", "success");
  }

  function handleFormSubmit(event, config, moduleName) {
    event.preventDefault();
    setFormError(config, "");

    const record = readFormRecord(config);
    const validationError = validateRecord(config, record);

    if (validationError) {
      setFormError(config, validationError);
      return;
    }

    const records = getRecords(config);
    const existingIndex = records.findIndex((item) => item.id === record.id);

    if (existingIndex >= 0) {
      records[existingIndex] = record;
    } else {
      records.unshift(record);
    }

    if (!saveRecords(config, records)) return;

    closeModal(config);
    refreshFilterOptions(config);
    renderTable(config, moduleName);
    updateDashboard();

    showToast(
      existingIndex >= 0
        ? "Record updated successfully."
        : "Record added successfully.",
      "success",
    );
  }

  /* ========================================================
       10. CSV EXPORT
    ======================================================== */

  function exportCSV(config, moduleName) {
    const records = filteredRecords(config);

    if (!records.length) {
      showToast("There are no records to export.", "warning");
      return;
    }

    const headers = Object.keys(records[0]);

    const escapeCSV = (value) => {
      const text = String(value ?? "");
      return '"' + text.replace(/"/g, '""') + '"';
    };

    const rows = [
      headers.map(escapeCSV).join(","),
      ...records.map((record) =>
        headers.map((header) => escapeCSV(record[header])).join(","),
      ),
    ];

    const csv = "\uFEFF" + rows.join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `admin-${moduleName}-${today()}.csv`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);

    showToast("CSV export started.", "success");
  }

  /* ========================================================
       11. INITIALIZE A MANAGEMENT MODULE
    ======================================================== */

  function initializeModule(moduleName, config) {
    if (!$(config.table)) return;

    let records = getRecords(config);

    records = records.map((record) => normalizeRecord(config, record));
    saveRecords(config, records);

    refreshFilterOptions(config);
    renderTable(config, moduleName);

    const search = $(config.search);

    if (search) {
      search.addEventListener("input", () => {
        renderTable(config, moduleName);
      });
    }

    config.filters.forEach((filter) => {
      const input = $(filter.id);

      if (input) {
        input.addEventListener("change", () => {
          renderTable(config, moduleName);
        });
      }
    });

    const resetButton = $(config.reset);

    if (resetButton) {
      resetButton.addEventListener("click", () => {
        if (search) search.value = "";

        config.filters.forEach((filter) => {
          const input = $(filter.id);
          if (input) input.value = "";
        });

        renderTable(config, moduleName);
      });
    }

    const exportButton = $(config.export);

    if (exportButton) {
      exportButton.addEventListener("click", () => {
        exportCSV(config, moduleName);
      });
    }

    const addButton = $(config.add);

    if (addButton) {
      addButton.addEventListener("click", () => {
        openModal(config, moduleName, null);
      });
    }

    const closeButton = $(config.close);
    const cancelButton = $(config.cancel);
    const modal = $(config.modal);
    const form = $(config.form);

    if (closeButton) {
      closeButton.addEventListener("click", () => closeModal(config));
    }

    if (cancelButton) {
      cancelButton.addEventListener("click", () => closeModal(config));
    }

    if (modal) {
      modal.addEventListener("click", (event) => {
        if (event.target === modal) closeModal(config);
      });
    }

    if (form) {
      form.addEventListener("submit", (event) => {
        handleFormSubmit(event, config, moduleName);
      });
    }

    const tableBody = $(config.table);

    if (tableBody) {
      tableBody.addEventListener("click", (event) => {
        const button = event.target.closest("button[data-action]");
        if (!button) return;

        const action = button.dataset.action;
        const recordId = button.dataset.id;

        const currentRecords = getRecords(config);
        const record = currentRecords.find((item) => item.id === recordId);

        if (!record) {
          showToast("This record could not be found.", "error");
          return;
        }

        if (action === "view") {
          viewRecord(config, record);
        } else if (action === "edit") {
          openModal(config, moduleName, record);
        } else if (action === "delete") {
          deleteRecord(config, moduleName, record);
        }
      });
    }

    /* Performance rating follows the score automatically
           unless the administrator selects a rating manually. */

    if (moduleName === "performance") {
      const scoreInput = $("performanceScore");
      const ratingInput = $("performanceRating");

      if (scoreInput && ratingInput) {
        scoreInput.addEventListener("input", () => {
          if (!ratingInput.value) {
            ratingInput.dataset.auto = "true";
          }

          if (ratingInput.dataset.auto === "true" || !ratingInput.value) {
            ratingInput.value = ratingFromScore(scoreInput.value);
          }
        });

        ratingInput.addEventListener("change", () => {
          ratingInput.dataset.auto = ratingInput.value ? "false" : "true";

          if (!ratingInput.value && scoreInput.value !== "") {
            ratingInput.value = ratingFromScore(scoreInput.value);
          }
        });
      }
    }
  }

  /* ========================================================
       12. DASHBOARD
    ======================================================== */

  function updateDashboard() {
    const athletes = getRecords(CONFIG.athletes);
    const coaches = getRecords(CONFIG.coaches);
    const sports = getRecords(CONFIG.sports);
    const courses = getRecords(CONFIG.courses);
    const schedule = getRecords(CONFIG.schedule);
    const attendance = getRecords(CONFIG.attendance);
    const events = getRecords(CONFIG.events);
    const performance = getRecords(CONFIG.performance);

    setText("totalAthletes", athletes.length);
    setText("totalCoaches", coaches.length);
    setText("totalSports", sports.length);
    setText("totalCourses", courses.length);

    /* Update any optional dashboard module counters. */

    setText("dashboardAttendance", attendance.length);
    setText("dashboardEvents", events.length);
    setText("dashboardAssessments", performance.length);
    setText("dashboardSessions", schedule.length);

    const dashboardAthleteBody = $("dashboardAthleteTableBody");

    if (dashboardAthleteBody) {
      const latest = [...athletes]
        .sort((a, b) => String(b.joined).localeCompare(String(a.joined)))
        .slice(0, 5);

      dashboardAthleteBody.innerHTML = latest.length
        ? latest
            .map(
              (athlete) => `
                    <tr>
                        <td>
                            <div class="table-person">
                                <div class="table-person-avatar">${escapeHTML(initials(athlete.name))}</div>
                                <div>
                                    <strong>${escapeHTML(athlete.name)}</strong>
                                    <small>${escapeHTML(athlete.email || "")}</small>
                                </div>
                            </div>
                        </td>
                        <td>${escapeHTML(athlete.sport || "—")}</td>
                        <td><span class="status-badge ${badgeClass(athlete.status)}">${escapeHTML(athlete.status)}</span></td>
                    </tr>
                `,
            )
            .join("")
        : `<tr><td colspan="3" class="empty-state">No athletes available.</td></tr>`;
    }

    const upcomingBody = $("dashboardScheduleBody");

    if (upcomingBody) {
      const upcoming = schedule
        .filter((item) => item.date >= today() && item.status !== "Cancelled")
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(0, 5);

      upcomingBody.innerHTML = upcoming.length
        ? upcoming
            .map(
              (item) => `
                    <tr>
                        <td><strong>${escapeHTML(item.title)}</strong><small>${escapeHTML(item.sport)}</small></td>
                        <td>${escapeHTML(formatDate(item.date))}</td>
                        <td>${escapeHTML(item.startTime || "—")}</td>
                        <td>${escapeHTML(item.venue || "—")}</td>
                    </tr>
                `,
            )
            .join("")
        : `<tr><td colspan="4" class="empty-state">No upcoming sessions.</td></tr>`;
    }

    const eventBody = $("dashboardEventBody");

    if (eventBody) {
      const upcomingEvents = events
        .filter((item) => item.date >= today() && item.status !== "Cancelled")
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(0, 5);

      eventBody.innerHTML = upcomingEvents.length
        ? upcomingEvents
            .map(
              (item) => `
                    <tr>
                        <td><strong>${escapeHTML(item.name)}</strong><small>${escapeHTML(item.type)}</small></td>
                        <td>${escapeHTML(formatDate(item.date))}</td>
                        <td>${escapeHTML(item.sport)}</td>
                        <td>${escapeHTML(item.registrations)} / ${escapeHTML(item.capacity)}</td>
                    </tr>
                `,
            )
            .join("")
        : `<tr><td colspan="4" class="empty-state">No upcoming events.</td></tr>`;
    }
  }

  /* ========================================================
       13. SIDEBAR AND SHARED UI
    ======================================================== */

  function initializeSidebar() {
    const sidebar = $("sidebar");
    const toggle = $("menuToggle");
    const overlay = $("sidebarOverlay");

    if (!sidebar || !toggle) return;

    function openSidebar() {
      sidebar.classList.add("open");

      if (overlay) {
        overlay.classList.add("show");
        overlay.hidden = false;
      }

      toggle.setAttribute("aria-expanded", "true");
      document.body.style.overflow = "hidden";
    }

    function closeSidebar() {
      sidebar.classList.remove("open");

      if (overlay) {
        overlay.classList.remove("show");
        overlay.hidden = true;
      }

      toggle.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    }

    toggle.addEventListener("click", () => {
      if (sidebar.classList.contains("open")) {
        closeSidebar();
      } else {
        openSidebar();
      }
    });

    if (overlay) {
      overlay.addEventListener("click", closeSidebar);
    }

    sidebar.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        if (window.innerWidth <= 900) closeSidebar();
      });
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeSidebar();

        Object.values(CONFIG).forEach((config) => {
          if ($(config.modal) && !$(config.modal).hidden) {
            closeModal(config);
          }
        });
      }
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 900) {
        closeSidebar();
      }
    });
  }

  function initializeSharedUI() {
    document
      .querySelectorAll(".current-year, #footerYear")
      .forEach((element) => {
        element.textContent = new Date().getFullYear();
      });

    initializeSidebar();
  }

  /* ========================================================
       14. START APPLICATION
    ======================================================== */

  function initialize() {
    initializeSharedUI();

    /* Initialize all module stores so the dashboard can
           show consistent sample records across admin pages. */

    Object.values(CONFIG).forEach((config) => {
      getRecords(config);
    });

    const moduleName = getModuleFromPage();

    if (moduleName && CONFIG[moduleName]) {
      initializeModule(moduleName, CONFIG[moduleName]);
    }

    updateDashboard();

    console.log("Sports Academy Admin Portal initialized.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize);
  } else {
    initialize();
  }
})();
