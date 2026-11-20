
/* ==========================================================================
   SPORTS ACADEMY MANAGEMENT SYSTEM
   Athlete Module — Shared JavaScript for all six HTML pages

   Pages:
   1. dashboard.html
   2. courses.html
   3. course.html
   4. statistics.html
   5. schedule.html
   6. events.html

   Storage:
   - Athlete profile, enrolments, notifications, event registrations,
     and sample records are stored in browser localStorage.
   - This is a frontend-only prototype. There is no backend or database.
   ========================================================================== */

(function () {
  "use strict";

  /* ============================================================
     1. CONFIGURATION AND HELPERS
     ============================================================ */

  var STORAGE = {
    profile: "sams_athlete_profile_v1",
    enrolments: "sams_athlete_enrolments_v1",
    notifications: "sams_athlete_notifications_v1",
    eventRegistrations: "sams_athlete_event_registrations_v1"
  };

  var $ = function (selector, root) {
    return (root || document).querySelector(selector);
  };

  var $$ = function (selector, root) {
    return Array.prototype.slice.call(
      (root || document).querySelectorAll(selector)
    );
  };

  var page = document.body.getAttribute("data-page") || "";

  function readStorage(key, fallback) {
    try {
      var value = localStorage.getItem(key);
      return value === null ? fallback : JSON.parse(value);
    } catch (error) {
      console.warn("Could not read browser storage:", key, error);
      return fallback;
    }
  }

  function writeStorage(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.warn("Could not save browser storage:", key, error);
      return false;
    }
  }

  function escapeHTML(value) {
    return String(value == null ? "" : value).replace(
      /[&<>"']/g,
      function (character) {
        return {
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;"
        }[character];
      }
    );
  }

  function todayString() {
    var date = new Date();
    var year = date.getFullYear();
    var month = String(date.getMonth() + 1).padStart(2, "0");
    var day = String(date.getDate()).padStart(2, "0");

    return year + "-" + month + "-" + day;
  }

  function dateOffset(days) {
    var date = new Date();
    date.setHours(12, 0, 0, 0);
    date.setDate(date.getDate() + days);

    var year = date.getFullYear();
    var month = String(date.getMonth() + 1).padStart(2, "0");
    var day = String(date.getDate()).padStart(2, "0");

    return year + "-" + month + "-" + day;
  }

  function formatDate(value) {
    if (!value) return "Not scheduled";

    var date = new Date(value + "T12:00:00");

    if (isNaN(date.getTime())) return escapeHTML(value);

    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  }

  function setText(id, value) {
    var element = document.getElementById(id);

    if (element) {
      element.textContent = value == null ? "" : String(value);
    }
  }

  function setHTML(id, value) {
    var element = document.getElementById(id);

    if (element) {
      element.innerHTML = value;
    }
  }

  function setHidden(element, hidden) {
    if (element) element.hidden = hidden;
  }

  function plural(number, singular, pluralWord) {
    return number + " " + (number === 1 ? singular : pluralWord || singular + "s");
  }

  function getInitials(name) {
    return String(name || "Athlete")
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map(function (part) {
        return part.charAt(0);
      })
      .join("")
      .toUpperCase();
  }

  function showMessage(element, message, type) {
    if (!element) return;

    element.textContent = message;
    element.classList.remove("success", "error", "warning");

    if (type) element.classList.add(type);
  }

  function safeArray(value) {
    return Array.isArray(value) ? value : [];
  }

  /* ============================================================
     2. DEMONSTRATION DATA
     ============================================================ */

  var courses = [
    {
      id: "COURSE001",
      code: "FB-101",
      name: "Football Fundamentals",
      sport: "Football",
      level: "Beginner",
      duration: "12 weeks",
      coach: "Rahul Sharma",
      schedule: "Monday and Wednesday, 4:00 PM",
      description:
        "Learn the foundations of football through guided practice, teamwork and skill development.",
      overview:
        "This course introduces essential football techniques, movement, passing and game awareness.",
      objectives: [
        "Develop ball control and passing skills.",
        "Understand basic football rules.",
        "Improve teamwork and coordination."
      ],
      requirements: [
        "Sportswear and suitable footwear.",
        "A water bottle.",
        "Regular participation in training."
      ],
      capacity: 25,
      fee: "₹1,500 / month",
      active: true
    },
    {
      id: "COURSE002",
      code: "CR-201",
      name: "Cricket Skills Development",
      sport: "Cricket",
      level: "Intermediate",
      duration: "16 weeks",
      coach: "Amit Verma",
      schedule: "Tuesday and Thursday, 5:00 PM",
      description:
        "Build batting, bowling and fielding skills through structured cricket training.",
      overview:
        "Practice match situations, technical fundamentals and team strategies under coach supervision.",
      objectives: [
        "Improve batting and bowling technique.",
        "Develop fielding and catching skills.",
        "Learn match strategy and communication."
      ],
      requirements: [
        "Suitable sportswear.",
        "Cricket equipment provided during supervised sessions.",
        "Commitment to regular practice."
      ],
      capacity: 20,
      fee: "₹1,800 / month",
      active: true
    },
    {
      id: "COURSE003",
      code: "BD-301",
      name: "Badminton Performance",
      sport: "Badminton",
      level: "Advanced",
      duration: "10 weeks",
      coach: "Neha Kapoor",
      schedule: "Monday and Friday, 6:00 PM",
      description:
        "Refine court movement, shot selection, stamina and competitive match skills.",
      overview:
        "An advanced programme focused on technique, tactical decision-making and match preparation.",
      objectives: [
        "Improve footwork and court coverage.",
        "Practise advanced shot combinations.",
        "Build tactical match awareness."
      ],
      requirements: [
        "Non-marking court shoes.",
        "Badminton racket.",
        "Previous playing experience."
      ],
      capacity: 16,
      fee: "₹2,000 / month",
      active: true
    },
    {
      id: "COURSE004",
      code: "BB-102",
      name: "Basketball Essentials",
      sport: "Basketball",
      level: "Beginner",
      duration: "12 weeks",
      coach: "Karan Singh",
      schedule: "Wednesday and Saturday, 5:30 PM",
      description:
        "Learn dribbling, passing, shooting and basic basketball teamwork.",
      overview:
        "A structured introduction to basketball skills and game rules.",
      objectives: [
        "Develop dribbling and passing.",
        "Practise shooting fundamentals.",
        "Understand basic team positioning."
      ],
      requirements: [
        "Sportswear and basketball shoes.",
        "A water bottle.",
        "Willingness to learn and practise."
      ],
      capacity: 22,
      fee: "₹1,500 / month",
      active: true
    },
    {
      id: "COURSE005",
      code: "AT-202",
      name: "Athletics and Conditioning",
      sport: "Athletics",
      level: "Intermediate",
      duration: "8 weeks",
      coach: "Priya Mehta",
      schedule: "Tuesday and Saturday, 6:30 AM",
      description:
        "Develop running technique, coordination and general athletic skills.",
      overview:
        "Training sessions introduce track fundamentals, movement drills and progressive conditioning.",
      objectives: [
        "Improve running technique.",
        "Practise coordination and movement drills.",
        "Track training progress over time."
      ],
      requirements: [
        "Comfortable sportswear.",
        "Running shoes.",
        "Water and appropriate sun protection."
      ],
      capacity: 24,
      fee: "₹1,200 / month",
      active: true
    },
    {
      id: "COURSE006",
      code: "TN-103",
      name: "Tennis Foundations",
      sport: "Tennis",
      level: "Beginner",
      duration: "10 weeks",
      coach: "Arjun Malhotra",
      schedule: "Thursday and Sunday, 7:00 AM",
      description:
        "Get started with tennis through racket skills, court positioning and guided practice.",
      overview:
        "A beginner-friendly course covering tennis technique, scoring and controlled rallies.",
      objectives: [
        "Learn basic forehand and backhand strokes.",
        "Understand scoring and court positioning.",
        "Build consistency through practice."
      ],
      requirements: [
        "Sportswear and court shoes.",
        "Tennis racket.",
        "Regular training attendance."
      ],
      capacity: 18,
      fee: "₹1,700 / month",
      active: true
    },
    {
      id: "COURSE007", code: "SW-104", name: "Swimming Fundamentals", sport: "Swimming", level: "Beginner", duration: "8 weeks", coach: "Meera Joshi", schedule: "Monday and Thursday, 7:00 AM",
      description: "Learn water confidence, floating, breathing and introductory swimming techniques in a supervised environment.",
      overview: "A beginner-friendly programme that develops water safety awareness and basic swimming skills with coach supervision.",
      objectives: ["Build water confidence and safe pool habits.", "Practise floating and breathing techniques.", "Learn introductory swimming strokes."],
      requirements: ["Swimwear and towel.", "Swimming cap and goggles if available.", "Follow all pool safety instructions."], capacity: 16, fee: "₹1,800 / month", active: true
    },
    {
      id: "COURSE008", code: "VB-105", name: "Volleyball Team Training", sport: "Volleyball", level: "Beginner", duration: "10 weeks", coach: "Vikram Gill", schedule: "Tuesday and Friday, 4:30 PM",
      description: "Build serving, passing, setting and teamwork skills through practical volleyball drills.",
      overview: "Learn core volleyball techniques, court positions and communication through progressive group sessions.",
      objectives: ["Practise serving and forearm passing.", "Develop setting and court movement.", "Understand rotations and team communication."],
      requirements: ["Sportswear and court shoes.", "Water bottle.", "Willingness to participate in team drills."], capacity: 20, fee: "₹1,400 / month", active: true
    },
    {
      id: "COURSE009", code: "TT-106", name: "Table Tennis Basics", sport: "Table Tennis", level: "Beginner", duration: "8 weeks", coach: "Simran Kaur", schedule: "Wednesday and Saturday, 4:00 PM",
      description: "Learn grip, stance, serves, returns and rally consistency in table tennis.",
      overview: "A structured introduction to table tennis fundamentals with guided practice and friendly games.",
      objectives: ["Learn correct grip and ready position.", "Practise basic serves and returns.", "Improve control and rally consistency."],
      requirements: ["Sportswear and non-marking shoes.", "Paddles are available during practice.", "Attend sessions regularly."], capacity: 14, fee: "₹1,200 / month", active: true
    },
    {
      id: "COURSE010", code: "YG-107", name: "Yoga and Mobility for Athletes", sport: "Yoga", level: "Beginner", duration: "6 weeks", coach: "Ananya Das", schedule: "Monday and Friday, 7:30 AM",
      description: "Explore guided mobility, balance, breathing and gentle stretching to support athletic movement.",
      overview: "A coach-led movement class focused on flexibility, balance, body awareness and recovery habits.",
      objectives: ["Practise basic yoga postures safely.", "Develop balance and mobility.", "Learn breathing and relaxation techniques."],
      requirements: ["Comfortable clothing.", "Yoga mat if available.", "Work within your comfort level and tell the coach about any discomfort."], capacity: 18, fee: "₹1,000 / month", active: true
    },
    {
      id: "COURSE011", code: "BX-108", name: "Boxing Fitness and Footwork", sport: "Boxing Fitness", level: "Beginner", duration: "8 weeks", coach: "Dev Malhotra", schedule: "Tuesday and Thursday, 6:00 PM",
      description: "Develop coordination, footwork, fitness and non-contact boxing fundamentals in a supervised class.",
      overview: "A fitness-focused introduction using movement drills, pad-work demonstrations and safe technique practice.",
      objectives: ["Improve coordination and footwork.", "Learn basic stance and movement.", "Build fitness through supervised drills."],
      requirements: ["Sportswear and training shoes.", "Bring a water bottle.", "Follow coach instructions and safety rules."], capacity: 16, fee: "₹1,600 / month", active: true
    },
    {
      id: "COURSE012", code: "GY-109", name: "Gymnastics and Coordination", sport: "Gymnastics", level: "Beginner", duration: "10 weeks", coach: "Pooja Nair", schedule: "Wednesday and Saturday, 5:00 PM",
      description: "Build foundational balance, coordination and movement skills with age-appropriate supervised activities.",
      overview: "A fundamentals course emphasizing safe progressions, body control and movement confidence.",
      objectives: ["Practise balance and coordination drills.", "Improve body awareness and control.", "Learn safe movement progressions."],
      requirements: ["Flexible sportswear.", "Barefoot or suitable footwear as instructed.", "Use equipment only with coach supervision."], capacity: 14, fee: "₹1,700 / month", active: true
    },
    {
      id: "COURSE013", code: "RU-110", name: "Rugby Skills Introduction", sport: "Rugby", level: "Beginner", duration: "10 weeks", coach: "Harpreet Singh", schedule: "Tuesday and Saturday, 4:30 PM",
      description: "Learn rugby rules, passing, catching, positioning and teamwork through non-contact introductory drills.",
      overview: "An introduction to rugby skills and game awareness that prioritizes safe, non-contact learning.",
      objectives: ["Learn basic rules and positions.", "Practise passing and catching.", "Develop teamwork and spatial awareness."],
      requirements: ["Sportswear and suitable outdoor shoes.", "Water bottle.", "Follow all coach-led safety instructions."], capacity: 22, fee: "₹1,400 / month", active: true
    },
    {
      id: "COURSE014", code: "FIT-111", name: "Strength and Conditioning Basics", sport: "Fitness", level: "Intermediate", duration: "8 weeks", coach: "Rohan Bedi", schedule: "Monday and Thursday, 5:30 PM",
      description: "Learn movement quality, bodyweight exercises and age-appropriate conditioning under coach supervision.",
      overview: "A guided programme focused on technique, general athletic conditioning and sustainable training habits.",
      objectives: ["Learn safe exercise technique.", "Develop coordination and general fitness.", "Understand warm-ups, cool-downs and recovery."],
      requirements: ["Comfortable sportswear and trainers.", "Water bottle.", "Use equipment only as directed by the coach."], capacity: 18, fee: "₹1,500 / month", active: true
    }
  ];

  var profileDefaults = {
    name: "Athlete1",
    sport: "Multi-Sport Athlete",
    memberId: "SA-001"
  };

  var profile = Object.assign(
    {},
    profileDefaults,
    readStorage(STORAGE.profile, {})
  );

  // Keep the demo profile generic until authentication supplies a real username.
  // Run this migration only once so a future login username is not overwritten.
  var profileNameMigrationKey = "sams_athlete_profile_name_migrated_v1";
  if (!readStorage(profileNameMigrationKey, false)) {
    profile.name = "Athlete1";
    writeStorage(STORAGE.profile, profile);
    writeStorage(profileNameMigrationKey, true);
  }

  var enrolments = safeArray(
    readStorage(STORAGE.enrolments, [])
  );

  var initialSessions = [
    {
      id: "SESSION001",
      date: dateOffset(-7),
      time: "4:00 PM - 5:00 PM",
      courseId: "COURSE001",
      coach: "Rahul Sharma",
      location: "Football Ground",
      status: "completed",
      attendance: "present"
    },
    {
      id: "SESSION002",
      date: dateOffset(-5),
      time: "5:30 PM - 6:30 PM",
      courseId: "COURSE004",
      coach: "Karan Singh",
      location: "Basketball Court",
      status: "completed",
      attendance: "present"
    },
    {
      id: "SESSION003",
      date: dateOffset(-3),
      time: "4:00 PM - 5:00 PM",
      courseId: "COURSE001",
      coach: "Rahul Sharma",
      location: "Football Ground",
      status: "completed",
      attendance: "absent"
    },
    {
      id: "SESSION004",
      date: dateOffset(-1),
      time: "5:30 PM - 6:30 PM",
      courseId: "COURSE004",
      coach: "Karan Singh",
      location: "Basketball Court",
      status: "completed",
      attendance: "present"
    },
    {
      id: "SESSION005",
      date: dateOffset(1),
      time: "4:00 PM - 5:00 PM",
      courseId: "COURSE001",
      coach: "Rahul Sharma",
      location: "Football Ground",
      status: "upcoming",
      attendance: "unrecorded"
    },
    {
      id: "SESSION006",
      date: dateOffset(2),
      time: "5:30 PM - 6:30 PM",
      courseId: "COURSE004",
      coach: "Karan Singh",
      location: "Basketball Court",
      status: "upcoming",
      attendance: "unrecorded"
    },
    {
      id: "SESSION007",
      date: dateOffset(4),
      time: "4:00 PM - 5:00 PM",
      courseId: "COURSE001",
      coach: "Rahul Sharma",
      location: "Football Ground",
      status: "upcoming",
      attendance: "unrecorded"
    },
    {
      id: "SESSION008",
      date: dateOffset(6),
      time: "5:30 PM - 6:30 PM",
      courseId: "COURSE004",
      coach: "Karan Singh",
      location: "Basketball Court",
      status: "upcoming",
      attendance: "unrecorded"
    }
  ];

  var initialPerformance = [
    {
      id: "PERF001",
      date: dateOffset(-7),
      courseId: "COURSE001",
      assessment: "Passing Drill",
      result: "8/10",
      remarks: "Good control and accuracy."
    },
    {
      id: "PERF002",
      date: dateOffset(-5),
      courseId: "COURSE004",
      assessment: "Dribbling Drill",
      result: "7/10",
      remarks: "Continue practising ball control."
    },
    {
      id: "PERF003",
      date: dateOffset(-1),
      courseId: "COURSE001",
      assessment: "Teamwork Assessment",
      result: "9/10",
      remarks: "Good communication and teamwork."
    }
  ];

  var initialEvents = [
    {
      id: "EVENT001",
      name: "Academy Football Cup",
      sport: "Football",
      date: dateOffset(7),
      time: "9:00 AM",
      location: "Main Football Ground",
      category: "Tournament",
      description:
        "An academy football competition focused on teamwork, sportsmanship and match experience.",
      capacity: 40,
      status: "upcoming"
    },
    {
      id: "EVENT002",
      name: "Cricket Skills Challenge",
      sport: "Cricket",
      date: dateOffset(12),
      time: "10:00 AM",
      location: "Cricket Practice Ground",
      category: "Competition",
      description:
        "Test your batting, bowling and fielding skills in a friendly academy challenge.",
      capacity: 30,
      status: "upcoming"
    },
    {
      id: "EVENT003",
      name: "Badminton Open Day",
      sport: "Badminton",
      date: dateOffset(18),
      time: "11:00 AM",
      location: "Indoor Sports Hall",
      category: "Sports Day",
      description:
        "Join practice games and meet fellow badminton players at the academy.",
      capacity: 24,
      status: "upcoming"
    },
    {
      id: "EVENT004",
      name: "Basketball Friendly",
      sport: "Basketball",
      date: dateOffset(25),
      time: "4:00 PM",
      location: "Basketball Court",
      category: "Friendly Match",
      description:
        "A friendly basketball event designed to build teamwork and match confidence.",
      capacity: 20,
      status: "upcoming"
    },
    {
      id: "EVENT005",
      name: "Athletics Assessment Day",
      sport: "Athletics",
      date: dateOffset(32),
      time: "7:00 AM",
      location: "Athletics Track",
      category: "Assessment",
      description:
        "Participate in supervised athletic assessments and review your progress.",
      capacity: 35,
      status: "upcoming"
    }
  ];

  var sessions = initialSessions;
  var performanceRecords = initialPerformance;
  var events = initialEvents;

  var eventRegistrations = safeArray(
    readStorage(STORAGE.eventRegistrations, [])
  );

  var notifications = readStorage(STORAGE.notifications, null);

  if (!Array.isArray(notifications)) {
    notifications = [
      {
        id: "NOTICE001",
        title: "Welcome to the Athlete Portal",
        detail: "Explore your courses, schedule and performance.",
        read: false
      },
      {
        id: "NOTICE002",
        title: "Check your training schedule",
        detail: "Review upcoming sessions before attending.",
        read: false
      }
    ];

    writeStorage(STORAGE.notifications, notifications);
  }

  function getCourse(courseId) {
    return courses.find(function (course) {
      return course.id === courseId;
    });
  }

  function courseName(courseId) {
    var course = getCourse(courseId);
    return course ? course.name : "Unknown course";
  }

  function isEnrolled(courseId) {
    return enrolments.indexOf(courseId) !== -1;
  }

  function isRegistered(eventId) {
    return eventRegistrations.indexOf(eventId) !== -1;
  }

  function saveEnrolments() {
    writeStorage(STORAGE.enrolments, enrolments);
  }

  function registerForCourse(courseId) {
    var course = getCourse(courseId);
    if (!course || !course.active || isEnrolled(courseId)) return false;
    enrolments.push(courseId);
    saveEnrolments();
    addNotification("Course enrolment successful", "You are now enrolled in " + course.name + ".");
    return true;
  }

  function saveRegistrations() {
    writeStorage(STORAGE.eventRegistrations, eventRegistrations);
  }

  /* ============================================================
     3. SHARED PROFILE AND NAVIGATION
     ============================================================ */

  function initProfile() {
    var name = profile.name || "Athlete";
    var initials = getInitials(name);

    setText("athlete-name", name);
    setText("athlete-avatar", initials);
    setText("profile-avatar", initials);
    setText("profile-display-name", name);
    setText("profile-sport", profile.sport || "Sports Academy");
    setText("profile-member-id", "Member ID: " + (profile.memberId || "SA-001"));

    var profileToggle = $("#profile-toggle");
    var profilePanel = $("#profile-panel");

    if (profileToggle && profilePanel) {
      profileToggle.addEventListener("click", function (event) {
        event.stopPropagation();

        var willOpen = profilePanel.hidden;
        profilePanel.hidden = !willOpen;
        profileToggle.setAttribute("aria-expanded", String(willOpen));

        var notificationPanel = $("#notification-panel");
        var notificationToggle = $("#notification-toggle");

        if (willOpen && notificationPanel) {
          notificationPanel.hidden = true;
          if (notificationToggle) {
            notificationToggle.setAttribute("aria-expanded", "false");
          }
        }
      });

      profilePanel.addEventListener("click", function (event) {
        event.stopPropagation();
      });
    }

    document.addEventListener("click", function () {
      if (profilePanel) profilePanel.hidden = true;
      if (profileToggle) {
        profileToggle.setAttribute("aria-expanded", "false");
      }

      var notificationPanel = $("#notification-panel");
      var notificationToggle = $("#notification-toggle");

      if (notificationPanel) notificationPanel.hidden = true;
      if (notificationToggle) {
        notificationToggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  function renderNotifications() {
    var list = $("#notification-list");
    var count = notifications.filter(function (item) {
      return !item.read;
    }).length;

    setText("notification-count", count);

    if (!list) return;

    if (!notifications.length) {
      list.innerHTML = '<p class="empty-state">You are all caught up.</p>';
      return;
    }

    list.innerHTML = notifications.map(function (item) {
      return (
        '<div class="notif-item ' + (item.read ? "" : "unread") + '">' +
          '<strong class="notif-title">' + escapeHTML(item.title) + "</strong>" +
          '<p class="notif-detail">' + escapeHTML(item.detail) + "</p>" +
        "</div>"
      );
    }).join("");
  }

  function initNotifications() {
    var toggle = $("#notification-toggle");
    var panel = $("#notification-panel");
    var markRead = $("#mark-notifications-read");

    if (toggle && panel) {
      toggle.addEventListener("click", function (event) {
        event.stopPropagation();

        var willOpen = panel.hidden;
        panel.hidden = !willOpen;
        toggle.setAttribute("aria-expanded", String(willOpen));

        var profilePanel = $("#profile-panel");
        var profileToggle = $("#profile-toggle");

        if (willOpen && profilePanel) {
          profilePanel.hidden = true;
          if (profileToggle) {
            profileToggle.setAttribute("aria-expanded", "false");
          }
        }
      });

      panel.addEventListener("click", function (event) {
        event.stopPropagation();
      });
    }

    if (markRead) {
      markRead.addEventListener("click", function () {
        notifications = notifications.map(function (item) {
          return Object.assign({}, item, { read: true });
        });

        writeStorage(STORAGE.notifications, notifications);
        renderNotifications();
      });
    }

    renderNotifications();
  }

  function addNotification(title, detail) {
    notifications.unshift({
      id: "NOTICE" + Date.now(),
      title: title,
      detail: detail,
      read: false
    });

    notifications = notifications.slice(0, 20);
    writeStorage(STORAGE.notifications, notifications);
    renderNotifications();
  }

  /* ============================================================
     4. SHARED RENDER HELPERS
     ============================================================ */

  function statusChip(status) {
    var labels = {
      upcoming: "Upcoming",
      completed: "Completed",
      cancelled: "Cancelled",
      present: "Present",
      absent: "Absent",
      unrecorded: "Not recorded",
      registered: "Registered",
      available: "Available",
      ongoing: "Ongoing"
    };

    var label = labels[status] || status || "Unknown";

    return (
      '<span class="status-chip status-' + escapeHTML(status) + '">' +
        escapeHTML(label) +
      "</span>"
    );
  }

  function getEventStatus(event) {
    if (event.status === "cancelled") return "cancelled";

    var today = todayString();

    if (event.date < today) return "completed";
    if (event.date === today) return "ongoing";

    return event.status === "ongoing" ? "ongoing" : "upcoming";
  }

  function getSessionStatus(session) {
    if (session.status === "cancelled") return "cancelled";
    if (session.date < todayString()) return "completed";
    if (session.date === todayString()) return "upcoming";

    return session.status || "upcoming";
  }

  function emptyRow(columns, message) {
    return (
      '<tr><td colspan="' + columns + '" class="empty-state">' +
        escapeHTML(message) +
      "</td></tr>"
    );
  }

  /* ============================================================
     5. DASHBOARD
     ============================================================ */

  function initDashboard() {
    if (page !== "dashboard") return;

    setText("welcome-title", "Welcome back, " + (profile.name || "Athlete") + "!");

    var enrolledCourses = courses.filter(function (course) {
      return isEnrolled(course.id);
    });

    var attendanceRecords = sessions.filter(function (session) {
      return session.attendance === "present" || session.attendance === "absent";
    });

    var attended = attendanceRecords.filter(function (session) {
      return session.attendance === "present";
    }).length;

    var attendanceRate = attendanceRecords.length
      ? Math.round((attended / attendanceRecords.length) * 100)
      : 0;

    var upcomingSessions = sessions.filter(function (session) {
      return getSessionStatus(session) === "upcoming" &&
        isEnrolled(session.courseId);
    }).sort(function (a, b) {
      return a.date.localeCompare(b.date);
    });

    var upcomingEvents = events.filter(function (event) {
      return getEventStatus(event) === "upcoming";
    }).sort(function (a, b) {
      return a.date.localeCompare(b.date);
    });

    setText("stat-courses", enrolledCourses.length);
    setText("stat-attendance", attendanceRate + "%");
    setText("stat-sessions", upcomingSessions.length);
    setText("stat-events", upcomingEvents.length);

    setText("performance-attendance", attendanceRate + "%");
    setText("performance-results", performanceRecords.length);

    var progress = $("#attendance-progress");

    if (progress) {
      progress.style.width = attendanceRate + "%";
      progress.setAttribute("role", "progressbar");
      progress.setAttribute("aria-valuemin", "0");
      progress.setAttribute("aria-valuemax", "100");
      progress.setAttribute("aria-valuenow", String(attendanceRate));
    }

    var courseContainer = $("#dashboard-courses");

    if (courseContainer) {
      courseContainer.innerHTML = enrolledCourses.length
        ? enrolledCourses.slice(0, 4).map(function (course) {
            return (
              '<div class="enrolment">' +
                '<div>' +
                  "<strong>" + escapeHTML(course.name) + "</strong>" +
                  '<p class="panel-sub">' + escapeHTML(course.coach) + "</p>" +
                "</div>" +
                '<span class="status-chip status-registered">Enrolled</span>' +
                '<a class="link-btn" href="course.html?id=' +
                  encodeURIComponent(course.id) + '">View</a>' +
              "</div>"
            );
          }).join("")
        : '<div class="empty-state">Explore courses to get started.</div>';
    }

    var scheduleContainer = $("#dashboard-schedule");

    if (scheduleContainer) {
      scheduleContainer.innerHTML = upcomingSessions.length
        ? upcomingSessions.slice(0, 4).map(function (session) {
            return (
              '<div class="schedule-item">' +
                '<div>' +
                  "<strong>" + escapeHTML(courseName(session.courseId)) + "</strong>" +
                  '<p class="panel-sub">' + escapeHTML(formatDate(session.date)) +
                    " · " + escapeHTML(session.time) + "</p>" +
                  '<p class="panel-sub">' + escapeHTML(session.location) + "</p>" +
                "</div>" +
                statusChip("upcoming") +
              "</div>"
            );
          }).join("")
        : '<div class="empty-state">No upcoming sessions for your enrolled courses.</div>';
    }

    var announcementContainer = $("#dashboard-announcements");

    if (announcementContainer) {
      announcementContainer.innerHTML = notifications.slice(0, 3).map(function (item) {
        return (
          '<div class="announce-item">' +
            '<strong>' + escapeHTML(item.title) + "</strong>" +
            '<p class="panel-sub">' + escapeHTML(item.detail) + "</p>" +
          "</div>"
        );
      }).join("") || '<div class="empty-state">No announcements available.</div>';
    }

    var eventContainer = $("#dashboard-events");

    if (eventContainer) {
      eventContainer.innerHTML = upcomingEvents.slice(0, 3).map(function (event) {
        return (
          '<div class="announce-item">' +
            "<strong>" + escapeHTML(event.name) + "</strong>" +
            '<p class="panel-sub">' + escapeHTML(formatDate(event.date)) +
              " · " + escapeHTML(event.location) + "</p>" +
          "</div>"
        );
      }).join("") || '<div class="empty-state">No upcoming events.</div>';
    }
  }

  /* ============================================================
     6. COURSES LIST
     ============================================================ */

  function renderMyCourses() {
    var container = $("#my-courses-list");
    if (!container) return;

    var enrolled = courses.filter(function (course) {
      return isEnrolled(course.id);
    });

    setText("my-enrolment-count", enrolled.length);

    container.innerHTML = enrolled.length
      ? enrolled.map(function (course) {
          return (
            '<div class="enrolment">' +
              '<div>' +
                "<strong>" + escapeHTML(course.name) + "</strong>" +
                '<p class="panel-sub">' + escapeHTML(course.sport) +
                  " · " + escapeHTML(course.level) + "</p>" +
              "</div>" +
              '<span class="status-chip status-registered">Enrolled</span>' +
              '<a class="link-btn" href="course.html?id=' +
                encodeURIComponent(course.id) + '">Details</a>' +
            "</div>"
          );
        }).join("")
      : '<div class="empty-state">You have not enrolled in any courses yet.</div>';
  }

  function renderCourseCard(course) {
    var enrolled = isEnrolled(course.id);

    return (
      '<article class="course-card">' +
        '<div class="course-card-top">' +
          '<span class="tag">' + escapeHTML(course.sport) + "</span>" +
          statusChip(enrolled ? "registered" : "available") +
        "</div>" +
        '<h3>' + escapeHTML(course.name) + "</h3>" +
        '<p class="panel-sub">' + escapeHTML(course.code) +
          " · " + escapeHTML(course.level) + "</p>" +
        '<p class="course-description">' + escapeHTML(course.description) + "</p>" +
        '<div class="course-card-meta">' +
          "<span><strong>Coach:</strong> " + escapeHTML(course.coach) + "</span>" +
          "<span><strong>Duration:</strong> " + escapeHTML(course.duration) + "</span>" +
          "<span><strong>Schedule:</strong> " + escapeHTML(course.schedule) + "</span>" +
        "</div>" +
        '<div class="course-card-actions">' +
          '<a class="btn btn-primary" href="course.html?id=' +
            encodeURIComponent(course.id) + '">View Details</a>' +
          (enrolled
            ? '<button type="button" class="btn btn-ghost" disabled>Enrolled</button>'
            : '<button type="button" class="btn btn-secondary course-register-btn" data-course-id="' +
                escapeHTML(course.id) + '">Join Course</button>') +
        "</div>" +
      "</article>"
    );
  }

  function initCourses() {
    if (page !== "courses") return;

    var search = $("#course-search");
    var sportFilter = $("#sport-filter");
    var levelFilter = $("#level-filter");
    var enrolmentFilter = $("#enrolment-filter");
    var reset = $("#reset-course-filters");
    var clear = $("#clear-course-search");

    var sports = Array.from(new Set(courses.map(function (course) {
      return course.sport;
    }))).sort();

    if (sportFilter) {
      sports.forEach(function (sport) {
        sportFilter.add(new Option(sport, sport));
      });
    }

    setText("available-course-count", courses.filter(function (course) {
      return course.active;
    }).length);

    setText("sports-offered-count", sports.length);

    function render() {
      var query = search ? search.value.trim().toLowerCase() : "";
      var sport = sportFilter ? sportFilter.value : "all";
      var level = levelFilter ? levelFilter.value : "all";
      var enrolment = enrolmentFilter ? enrolmentFilter.value : "all";

      var filtered = courses.filter(function (course) {
        var matchesSearch = [
          course.name,
          course.sport,
          course.coach,
          course.code,
          course.description
        ].join(" ").toLowerCase().indexOf(query) !== -1;

        // HTML default options use empty values, so empty means no filter.
        var matchesSport =
          sport === "" || sport === "all" || course.sport === sport;
        var matchesLevel =
          level === "" || level === "all" || course.level === level;
        var matchesEnrolment =
          enrolment === "" ||
          enrolment === "all" ||
          (enrolment === "enrolled" && isEnrolled(course.id)) ||
          (enrolment === "available" && !isEnrolled(course.id));

        return course.active && matchesSearch && matchesSport &&
          matchesLevel && matchesEnrolment;
      });

      var container = $("#course-list");
      var noResults = $("#no-courses-message");

      if (container) {
        container.innerHTML = filtered.map(renderCourseCard).join("");
      }

      setText("course-results-count", plural(filtered.length, "course"));

      if (noResults) noResults.hidden = filtered.length !== 0;

      renderMyCourses();
    }

    var courseList = $("#course-list");

    if (courseList) {
      courseList.addEventListener("click", function (event) {
        var button = event.target.closest("[data-course-id]");
        if (!button || button.disabled) return;
        if (registerForCourse(button.getAttribute("data-course-id"))) render();
      });
    }

    [search, sportFilter, levelFilter, enrolmentFilter].forEach(function (element) {
      if (!element) return;

      element.addEventListener(
        element.tagName === "INPUT" ? "input" : "change",
        render
      );
    });

    function resetFilters() {
      if (search) search.value = "";
      if (sportFilter) sportFilter.value = "";
      if (levelFilter) levelFilter.value = "";
      if (enrolmentFilter) enrolmentFilter.value = "";

      render();
    }

    if (reset) reset.addEventListener("click", resetFilters);
    if (clear) clear.addEventListener("click", resetFilters);

    render();
  }

  /* ============================================================
     7. COURSE DETAILS AND ENROLMENT
     ============================================================ */

  function initCourseDetails() {
    if (page !== "course") return;

    var params = new URLSearchParams(window.location.search);
    var courseId = params.get("id");
    var course = getCourse(courseId);

    var enrolButton = $("#enrol-course-btn");
    var cancelButton = $("#cancel-enrolment-btn");
    var message = $("#enrolment-message");

    if (!course) {
      setText("detail-course-name", "Course not found");
      setText("detail-description", "This course does not exist or the link is invalid.");
      setText("enrolment-course-name", "Course unavailable");
      showMessage(message, "Please return to the courses page and select a valid course.", "error");

      if (enrolButton) enrolButton.disabled = true;
      if (cancelButton) cancelButton.hidden = true;

      return;
    }

    setText("detail-sport", course.sport);
    setText("detail-status", course.active ? "Available" : "Unavailable");
    setText("detail-course-code", course.code);
    setText("detail-course-name", course.name);
    setText("detail-description", course.description);
    setText("detail-level", course.level);
    setText("detail-duration", course.duration);
    setText("detail-coach", course.coach);
    setText("detail-schedule", course.schedule);
    setText("detail-overview", course.overview);

    setHTML("detail-objectives", course.objectives.map(function (item) {
      return "<li>" + escapeHTML(item) + "</li>";
    }).join(""));

    setHTML("detail-requirements", course.requirements.map(function (item) {
      return "<li>" + escapeHTML(item) + "</li>";
    }).join(""));

    setText("enrolment-course-name", course.name);
    setText("enrolment-sport", course.sport + " · " + course.level);

    function refreshButtons() {
      var enrolled = isEnrolled(course.id);

      if (enrolButton) {
        enrolButton.disabled = !course.active || enrolled;
        enrolButton.textContent = enrolled ? "Already Enrolled" : "Enrol Now";
      }

      if (cancelButton) {
        cancelButton.hidden = !enrolled;
      }

      if (enrolled) {
        showMessage(message, "You are enrolled in this course.", "success");
      } else {
        showMessage(message, "Review the course details before enrolling.", "");
      }
    }

    if (enrolButton) {
      enrolButton.addEventListener("click", function () {
        if (!course.active || isEnrolled(course.id)) return;

        enrolments.push(course.id);
        saveEnrolments();

        addNotification(
          "Course enrolment successful",
          "You are now enrolled in " + course.name + "."
        );

        showMessage(message, "Enrolment successful! This is saved in your browser.", "success");
        refreshButtons();
      });
    }

    if (cancelButton) {
      cancelButton.addEventListener("click", function () {
        if (!isEnrolled(course.id)) return;

        var confirmed = window.confirm(
          "Are you sure you want to cancel your enrolment in " + course.name + "?"
        );

        if (!confirmed) return;

        enrolments = enrolments.filter(function (id) {
          return id !== course.id;
        });

        saveEnrolments();

        addNotification(
          "Course enrolment cancelled",
          "Your enrolment in " + course.name + " has been cancelled."
        );

        showMessage(message, "Your enrolment has been cancelled.", "warning");
        refreshButtons();
      });
    }

    refreshButtons();
  }

  /* ============================================================
     8. STATISTICS
     ============================================================ */

  function initStatistics() {
    if (page !== "statistics") return;

    var filter = $("#statistics-course-filter");

    if (filter) {
      courses.forEach(function (course) {
        filter.add(new Option(course.name, course.id));
      });
    }

    function render() {
      var selectedCourse = filter ? filter.value : "all";

      var filteredSessions = sessions.filter(function (session) {
        return selectedCourse === "all" || session.courseId === selectedCourse;
      });

      var recorded = filteredSessions.filter(function (session) {
        return session.attendance === "present" || session.attendance === "absent";
      });

      var attended = recorded.filter(function (session) {
        return session.attendance === "present";
      }).length;

      var absent = recorded.filter(function (session) {
        return session.attendance === "absent";
      }).length;

      var unrecorded = filteredSessions.filter(function (session) {
        return session.attendance === "unrecorded";
      }).length;

      var attendanceRate = recorded.length
        ? Math.round((attended / recorded.length) * 100)
        : 0;

      var filteredPerformance = performanceRecords.filter(function (record) {
        return selectedCourse === "all" || record.courseId === selectedCourse;
      });

      setText("overall-attendance", attendanceRate + "%");
      setText("attended-sessions", attended);
      setText("total-sessions", filteredSessions.length);
      setText("performance-count", filteredPerformance.length);

      setText("statistics-attendance-rate", attendanceRate + "%");
      setText(
        "statistics-attendance-message",
        recorded.length
          ? "Attendance is calculated from " + recorded.length + " recorded sessions."
          : "No attendance has been recorded for this selection yet."
      );

      setText("attendance-present-count", attended);
      setText("attendance-absent-count", absent);
      setText("attendance-unrecorded-count", unrecorded);

      var progress = $("#statistics-attendance-progress");

      if (progress) {
        progress.style.width = attendanceRate + "%";
        progress.setAttribute("aria-valuenow", String(attendanceRate));
      }

      var attendanceBody = $("#attendance-records");

      if (attendanceBody) {
        attendanceBody.innerHTML = filteredSessions.length
          ? filteredSessions.slice().sort(function (a, b) {
              return b.date.localeCompare(a.date);
            }).map(function (session) {
              return (
                "<tr>" +
                  "<td>" + escapeHTML(formatDate(session.date)) + "</td>" +
                  "<td>" + escapeHTML(courseName(session.courseId)) + "</td>" +
                  "<td>" + escapeHTML(session.time) + "</td>" +
                  "<td>" + statusChip(session.attendance) + "</td>" +
                "</tr>"
              );
            }).join("")
          : emptyRow(4, "No attendance records found.");
      }

      setText("attendance-record-count", plural(filteredSessions.length, "record"));

      var performanceBody = $("#performance-records");

      if (performanceBody) {
        performanceBody.innerHTML = filteredPerformance.length
          ? filteredPerformance.slice().sort(function (a, b) {
              return b.date.localeCompare(a.date);
            }).map(function (record) {
              return (
                "<tr>" +
                  "<td>" + escapeHTML(formatDate(record.date)) + "</td>" +
                  "<td>" + escapeHTML(courseName(record.courseId)) + "</td>" +
                  "<td>" + escapeHTML(record.assessment) + "</td>" +
                  "<td>" + escapeHTML(record.result) + "</td>" +
                  "<td>" + escapeHTML(record.remarks) + "</td>" +
                "</tr>"
              );
            }).join("")
          : emptyRow(5, "No performance records found.");
      }

      setText(
        "performance-record-count",
        plural(filteredPerformance.length, "record")
      );
    }

    if (filter) filter.addEventListener("change", render);

    render();
  }

  /* ============================================================
     9. TRAINING SCHEDULE
     ============================================================ */

  function initSchedule() {
    if (page !== "schedule") return;

    var search = $("#schedule-search");
    var courseFilter = $("#schedule-course-filter");
    var statusFilter = $("#schedule-status-filter");
    var dateFilter = $("#schedule-date-filter");
    var reset = $("#reset-schedule-filters");
    var clear = $("#clear-schedule-filters");

    if (courseFilter) {
      courses.forEach(function (course) {
        courseFilter.add(new Option(course.name, course.id));
      });
    }

    function render() {
      var query = search ? search.value.trim().toLowerCase() : "";
      var selectedCourse = courseFilter ? courseFilter.value : "all";
      var selectedStatus = statusFilter ? statusFilter.value : "all";
      var selectedDate = dateFilter ? dateFilter.value : "";

      var allForAthlete = sessions.filter(function (session) {
        return isEnrolled(session.courseId);
      });

      var upcoming = allForAthlete.filter(function (session) {
        return getSessionStatus(session) === "upcoming";
      });

      var completed = allForAthlete.filter(function (session) {
        return getSessionStatus(session) === "completed";
      });

      setText("schedule-total-count", allForAthlete.length);
      setText("schedule-upcoming-count", upcoming.length);
      setText("schedule-completed-count", completed.length);

      var filtered = allForAthlete.filter(function (session) {
        var status = getSessionStatus(session);
        var searchable = [
          courseName(session.courseId),
          session.coach,
          session.location,
          session.time
        ].join(" ").toLowerCase();

        return (
          (!query || searchable.indexOf(query) !== -1) &&
          (selectedCourse === "all" || session.courseId === selectedCourse) &&
          (selectedStatus === "all" || status === selectedStatus) &&
          (!selectedDate || session.date === selectedDate)
        );
      }).sort(function (a, b) {
        return a.date.localeCompare(b.date);
      });

      var upcomingForAthlete = filtered.filter(function (session) {
        return getSessionStatus(session) === "upcoming";
      });

      var upcomingContainer = $("#upcoming-sessions");

      if (upcomingContainer) {
        upcomingContainer.innerHTML = upcomingForAthlete.length
          ? upcomingForAthlete.map(function (session) {
              return (
                '<div class="schedule-item">' +
                  '<div class="schedule-date">' +
                    '<strong>' + escapeHTML(formatDate(session.date)) + "</strong>" +
                    '<span>' + escapeHTML(session.time) + "</span>" +
                  "</div>" +
                  '<div class="schedule-details">' +
                    "<strong>" + escapeHTML(courseName(session.courseId)) + "</strong>" +
                    '<p class="panel-sub">Coach: ' + escapeHTML(session.coach) + "</p>" +
                    '<p class="panel-sub">' + escapeHTML(session.location) + "</p>" +
                  "</div>" +
                  statusChip("upcoming") +
                "</div>"
              );
            }).join("")
          : '<div class="empty-state">No upcoming sessions match your filters.</div>';
      }

      setText("upcoming-session-count", plural(upcomingForAthlete.length, "session"));
      setText("schedule-results-count", plural(filtered.length, "session"));

      var body = $("#schedule-records");

      if (body) {
        body.innerHTML = filtered.length
          ? filtered.map(function (session) {
              return (
                "<tr>" +
                  "<td>" + escapeHTML(formatDate(session.date)) + "</td>" +
                  "<td>" + escapeHTML(session.time) + "</td>" +
                  "<td>" + escapeHTML(courseName(session.courseId)) + "</td>" +
                  "<td>" + escapeHTML(session.coach) + "</td>" +
                  "<td>" + escapeHTML(session.location) + "</td>" +
                  "<td>" + statusChip(getSessionStatus(session)) + "</td>" +
                "</tr>"
              );
            }).join("")
          : emptyRow(6, "No sessions match your filters.");
      }

      setHidden($("#no-schedule-results"), filtered.length !== 0);
    }

    [search, courseFilter, statusFilter, dateFilter].forEach(function (element) {
      if (!element) return;

      element.addEventListener(
        element.tagName === "INPUT" && element.type === "search"
          ? "input"
          : "change",
        render
      );
    });

    function resetFilters() {
      if (search) search.value = "";
      if (courseFilter) courseFilter.value = "all";
      if (statusFilter) statusFilter.value = "all";
      if (dateFilter) dateFilter.value = "";

      render();
    }

    if (reset) reset.addEventListener("click", resetFilters);
    if (clear) clear.addEventListener("click", resetFilters);

    render();
  }

  /* ============================================================
     10. EVENTS
     ============================================================ */

  function renderEventCard(event) {
    var registered = isRegistered(event.id);
    var status = getEventStatus(event);

    return (
      '<article class="event-card">' +
        '<div class="event-card-top">' +
          '<span class="tag">' + escapeHTML(event.sport) + "</span>" +
          statusChip(status) +
        "</div>" +
        '<p class="eyebrow">' + escapeHTML(event.category) + "</p>" +
        "<h3>" + escapeHTML(event.name) + "</h3>" +
        '<p class="event-description">' + escapeHTML(event.description) + "</p>" +
        '<div class="event-meta">' +
          "<p><strong>Date:</strong> " + escapeHTML(formatDate(event.date)) + "</p>" +
          "<p><strong>Time:</strong> " + escapeHTML(event.time) + "</p>" +
          "<p><strong>Location:</strong> " + escapeHTML(event.location) + "</p>" +
          "<p><strong>Capacity:</strong> " + escapeHTML(event.capacity) + " participants</p>" +
        "</div>" +
        '<div class="event-card-actions">' +
          '<button type="button" class="btn btn-ghost event-details-btn" data-event-id="' +
            escapeHTML(event.id) + '">View Details</button>' +
          '<button type="button" class="btn ' +
            (registered ? "btn-ghost" : "btn-primary") +
            ' event-register-btn" data-event-id="' + escapeHTML(event.id) + '"' +
            (registered || status !== "upcoming" ? " disabled" : "") + ">" +
            (registered ? "Registered" : "Register") +
          "</button>" +
        "</div>" +
      "</article>"
    );
  }

  function initEvents() {
    if (page !== "events") return;

    var search = $("#event-search");
    var sportFilter = $("#event-sport-filter");
    var statusFilter = $("#event-status-filter");
    var registrationFilter = $("#event-registration-filter");
    var reset = $("#reset-event-filters");
    var clear = $("#clear-event-filters");

    var dialog = $("#event-details-dialog");
    var dialogTitle = $("#event-dialog-title");
    var dialogBody = $("#event-dialog-body");
    var dialogRegister = $("#event-dialog-register");
    var dialogCancel = $("#event-dialog-cancel");
    var dialogClose = $("#close-event-dialog");

    var selectedEventId = null;

    var sports = Array.from(new Set(events.map(function (event) {
      return event.sport;
    }))).sort();

    if (sportFilter) {
      sports.forEach(function (sport) {
        sportFilter.add(new Option(sport, sport));
      });
    }

    function updateSummary() {
      var upcoming = events.filter(function (event) {
        return getEventStatus(event) === "upcoming";
      }).length;

      setText("event-total-count", events.length);
      setText("event-upcoming-count", upcoming);
      setText("event-registered-count", eventRegistrations.length);
      setText("my-event-count", plural(eventRegistrations.length, "event", "events"));
    }

    function renderMyEvents() {
      var container = $("#my-events-list");
      if (!container) return;

      var registered = events.filter(function (event) {
        return isRegistered(event.id);
      });

      container.innerHTML = registered.length
        ? registered.map(renderEventCard).join("")
        : '<div class="empty-state">You have not registered for any events yet.</div>';
    }

    function render() {
      var query = search ? search.value.trim().toLowerCase() : "";
      var sport = sportFilter ? sportFilter.value : "all";
      var status = statusFilter ? statusFilter.value : "all";
      var registration = registrationFilter ? registrationFilter.value : "all";

      var filtered = events.filter(function (event) {
        var matchesSearch = [
          event.name,
          event.sport,
          event.location,
          event.category,
          event.description
        ].join(" ").toLowerCase().indexOf(query) !== -1;

        var eventStatus = getEventStatus(event);

        var matchesSport = sport === "all" || event.sport === sport;
        var matchesStatus = status === "all" || eventStatus === status;
        var matchesRegistration =
          registration === "all" ||
          (registration === "registered" && isRegistered(event.id)) ||
          (registration === "available" && !isRegistered(event.id));

        return matchesSearch && matchesSport &&
          matchesStatus && matchesRegistration;
      });

      var container = $("#event-list");
      var noResults = $("#no-events-message");

      if (container) {
        container.innerHTML = filtered.map(renderEventCard).join("");
      }

      setText("event-results-count", plural(filtered.length, "event"));

      if (noResults) noResults.hidden = filtered.length !== 0;

      updateSummary();
      renderMyEvents();
    }

    function openEventDetails(eventId) {
      var event = events.find(function (item) {
        return item.id === eventId;
      });

      if (!event || !dialog) return;

      selectedEventId = event.id;

      if (dialogTitle) dialogTitle.textContent = event.name;

      if (dialogBody) {
        dialogBody.innerHTML =
          '<div class="event-detail-content">' +
            '<span class="tag">' + escapeHTML(event.sport) + "</span>" +
            "<p>" + escapeHTML(event.description) + "</p>" +
            "<p><strong>Category:</strong> " + escapeHTML(event.category) + "</p>" +
            "<p><strong>Date:</strong> " + escapeHTML(formatDate(event.date)) + "</p>" +
            "<p><strong>Time:</strong> " + escapeHTML(event.time) + "</p>" +
            "<p><strong>Location:</strong> " + escapeHTML(event.location) + "</p>" +
            "<p><strong>Capacity:</strong> " + escapeHTML(event.capacity) + " participants</p>" +
            "<p><strong>Status:</strong> " + escapeHTML(getEventStatus(event)) + "</p>" +
          "</div>";
      }

      if (dialogRegister) {
        var registered = isRegistered(event.id);
        var available = getEventStatus(event) === "upcoming";

        dialogRegister.hidden = registered || !available;
        dialogRegister.disabled = registered || !available;
        dialogRegister.textContent = registered ? "Already Registered" : "Register for Event";
      }

      if (typeof dialog.showModal === "function") {
        if (!dialog.open) dialog.showModal();
      } else {
        dialog.setAttribute("open", "");
      }
    }

    function closeDialog() {
      if (!dialog) return;

      if (typeof dialog.close === "function" && dialog.open) {
        dialog.close();
      } else {
        dialog.removeAttribute("open");
      }

      selectedEventId = null;
    }

    function registerForEvent(eventId) {
      var event = events.find(function (item) {
        return item.id === eventId;
      });

      if (!event) return;

      if (getEventStatus(event) !== "upcoming") {
        window.alert("Registration is available only for upcoming events.");
        return;
      }

      if (isRegistered(event.id)) {
        window.alert("You have already registered for this event.");
        return;
      }

      if (eventRegistrations.length >= 50) {
        window.alert("This demonstration account has reached its registration limit.");
        return;
      }

      eventRegistrations.push(event.id);
      saveRegistrations();

      addNotification(
        "Event registration successful",
        "You are registered for " + event.name + "."
      );

      render();

      if (dialog && dialog.open) {
        openEventDetails(event.id);
      }
    }

    var eventList = $("#event-list");
    var myEventsList = $("#my-events-list");

    [eventList, myEventsList].forEach(function (container) {
      if (!container) return;

      container.addEventListener("click", function (event) {
        var detailsButton = event.target.closest(".event-details-btn");
        var registerButton = event.target.closest(".event-register-btn");

        if (detailsButton) {
          openEventDetails(detailsButton.getAttribute("data-event-id"));
        }

        if (registerButton && !registerButton.disabled) {
          registerForEvent(registerButton.getAttribute("data-event-id"));
        }
      });
    });

    if (dialogRegister) {
      dialogRegister.addEventListener("click", function () {
        if (selectedEventId) registerForEvent(selectedEventId);
      });
    }

    if (dialogCancel) {
      dialogCancel.addEventListener("click", closeDialog);
    }

    if (dialogClose) {
      dialogClose.addEventListener("click", closeDialog);
    }

    if (dialog) {
      dialog.addEventListener("click", function (event) {
        if (event.target === dialog) closeDialog();
      });
    }

    [search, sportFilter, statusFilter, registrationFilter].forEach(function (element) {
      if (!element) return;

      element.addEventListener(
        element.tagName === "INPUT" ? "input" : "change",
        render
      );
    });

    function resetFilters() {
      if (search) search.value = "";
      if (sportFilter) sportFilter.value = "all";
      if (statusFilter) statusFilter.value = "all";
      if (registrationFilter) registrationFilter.value = "all";

      render();
    }

    if (reset) reset.addEventListener("click", resetFilters);
    if (clear) clear.addEventListener("click", resetFilters);

    render();
  }

  /* ============================================================
     11. START THE CORRECT PAGE
     ============================================================ */

  function init() {
    initProfile();
    initNotifications();

    initDashboard();
    initCourses();
    initCourseDetails();
    initStatistics();
    initSchedule();
    initEvents();

    console.log(
      "Sports Academy Athlete Module initialized:",
      page || "unknown page"
    );
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
