// ============================================================
// UNILINK STORIES — SEASON 1, EPISODE 1
// "THE GREAT UI EXAM EMERGENCY"
// An Interactive Campus Adventure
// University of Ibadan, Nigeria
//
// Estimated Playtime: 45–60 minutes
// Unique Endings: 6
// Replay Value: High (choices change character reactions + ending)
// ============================================================

// --- GLOBAL STATE VARIABLES ---
VAR matric_card = false
VAR notes_found = false
VAR course_form_stamped = false
VAR danfo_survived = false
VAR puff_puff_eaten = false
VAR energy_boosted = false
VAR emeka_rival = true
VAR grace_ally = false
VAR caught_cheating = false
VAR bribed_conductor = false

// --- REPUTATION TRACKERS ---
VAR gbenga_rep = 0
VAR alhaji_rep = 0
VAR grace_rep = 0
VAR emeka_score = 0   // how much Emeka has outplayed you

// --- RESOURCE TRACKER ---
VAR naira = 200
VAR phone_battery = 5

// --- XP TRACKER ---
VAR total_xp = 0

-> cold_open

// ============================================================
// COLD OPEN
// ============================================================
=== cold_open ===

# image_waking_up
📍 UNIVERSITY OF IBADAN — HALL 4 MALE HOSTEL
⏰ 7:03 AM

You are asleep.

You should not be asleep.

Your GST 201 exam — Use of English, the one course that somehow controls your academic destiny despite being completely unrelated to whatever you came to UI to study — starts at 10:00 AM.

It is now 7:03 AM.

The NEPA cut light at midnight. Your phone, which you left plugged in "just in case the power comes back," is at 5%. The alarm you set at 11:58 PM did not go off. It died with the power. It is gone. Like your preparation. Like your dignity.

Something kicks your mattress.

Roommate Seun: Bross. Bross! BROSS!

You open one eye.

Roommate Seun: It's seven o'clock. You said wake you at six. I forgot until just now. I'm sorry.

You stare at him for a long time.

You: Where is my matric card, Seun?
Roommate Seun: ...Which one?
You: MY matric card. The laminated one with my face on it.
Roommate Seun: The one you left at the SUG building on Thursday during the Whot tournament?
You: ...Yes.
Roommate Seun: The one I told you to go and collect on Friday?
You: ...
Roommate Seun: The one I sent you three WhatsApp reminders about?
You: Seun, I need solutions, not a historical review.

He pulls his pillow over his face.

Roommate Seun: (muffled) The SUG is locked until 9 AM. You have no matric card. Your exam is at 10. Your course form is also not signed. And your notes... bro do you even have notes?

The full weight of your situation descends on you like a FEDEX package of consequences.

You have approximately 2 hours and 57 minutes to:
1. Obtain a valid ID
2. Get your course form signed
3. Find notes for a course you attended 3 times
4. Actually arrive at Alexander Brown Hall

You have 200 naira, 5% battery, and the audacity that only a UI student can possess.

+ [Jump up immediately. This is survivable — you've survived worse.] -> morning_plan
+ [Lie in bed for two more minutes thinking] -> procrastinate_opening
+ [Ask Seun to lend you his matric card as a joke] -> seun_card_joke

=== procrastinate_opening ===
You lie there for exactly 118 seconds staring at the ceiling.

You have spent these seconds not thinking about solutions. You have spent them remembering a meme you saw on Wednesday.

Roommate Seun: Bross. You're still lying down.
You: I'm strategizing.
Roommate Seun: Your eyes were closed.
You: I strategize with my eyes closed. It's a technique.

Seun throws your shoe at you.

You: Okay. Okay. I'm up.

~ total_xp = total_xp - 5
(You lost 5 XP for lying there. That was your fault entirely.)

-> morning_plan

=== seun_card_joke ===
You: Seun. Seun abeg. Lend me your matric card.
Roommate Seun: My own card? With my own face?
You: Just for the exam—
Roommate Seun: The invigilator is Mrs. Balogun.

A silence falls over the room.

You: ...Mrs. Balogun.
Roommate Seun: The same Mrs. Balogun who arrested a goat in 2019 for entering an exam hall without registration.
You: I heard about the goat.
Roommate Seun: The goat's case is still in review. The GOAT, bro. It is currently appealing.

You decide not to use Seun's card.

-> morning_plan

// ============================================================
// ACT 1 — MORNING DECISIONS
// ============================================================
=== morning_plan ===

You are standing. This is the first victory.

The Hall 4 corridor is already buzzing. Other students are sprinting past with towels, textbooks, and the dead eyes of people who studied until 4 AM. One boy is still asleep standing up, leaning on a wall. His body has given up. His spirit has departed.

You need to move fast. But you also haven't eaten since yesterday at 2 PM, and your brain — specifically the part responsible for recalling all 27 figures of speech — runs on food.

Roommate Seun: (from inside) Don't forget, the Faculty Admin is opening at 8 AM — you need your temporary ID from Mr. Gbenga first before anything else.

* [Sprint straight to Faculty Admin Block — ID first, everything else later] -> admin_block_early
* [Go to Mama Bisi's Buka first — cannot think on empty stomach] -> mama_bisi
* [Run to the SUG building to check if it's open early] -> sug_attempt

=== sug_attempt ===

📍 SUG BUILDING — STUDENT UNION GOVERNMENT
⏰ 7:18 AM

You jog across campus. The morning air smells of dew, generator fumes, and impending consequences.

The SUG building is, as Seun predicted, completely locked. A padlock the size of a small child is chained across the door.

But — slightly miraculously — there is a cleaner mopping the front steps. His name tag says "Emmanuel."

You: Bros, please. My matric card is inside. I left it here Thursday during a Whot game. I have an exam at ten.

Emmanuel looks at you. He looks at the padlock. He looks at the sky.

Emmanuel: The man with the key doesn't come until 9.
You: Is there any way—
Emmanuel: One of the windows at the back doesn't lock properly.

He returns to mopping. He says nothing else. He is a man of minimum words and maximum implication.

* [Go around to the back window — retrieve your card yourself] -> sug_window
* [This is too risky. Go to Faculty Admin instead.] -> mama_bisi
* [Wait here until 9 AM for the key holder] -> wait_for_sug

=== wait_for_sug ===
You sit on the SUG steps and wait.

At 8:13 AM, a man arrives with keys. He opens the padlock with the slow deliberateness of someone who has never once been in a hurry.

You rush inside. Your matric card is on the Whot table exactly where you left it. Face down. Next to a suspicious pile of fifty-naira notes.

Someone was using your face as a lucky charm.

~ matric_card = true
~ total_xp = total_xp + 15
(You got your card back! But you lost almost an hour. It's now 8:20 AM.)

-> mama_bisi

=== sug_window ===
You go around the back. The window Emmanuel mentioned is — yes — slightly ajar. You're a grown adult and this is technically university property and you technically have property inside.

You squeeze through. You are in. The Whot table is right there. Your card is face-down next to approximately 800 naira in scattered notes. Your card was apparently used as a lucky charm in last night's game.

You grab your card and slip back out.

Emmanuel sees you emerge from around the corner. He nods once and mops.

~ matric_card = true
~ total_xp = total_xp + 30
# item_matric_card

You: Thank you, Emmanuel.
Emmanuel: I saw nothing.

-> mama_bisi

=== admin_block_early ===

📍 FACULTY OF ARTS ADMIN BLOCK
⏰ 7:25 AM

The admin block is still locked. A handwritten sign on the door reads: "OPENS 8:00 AM. WE MEAN 8:00 AM. NOT 7:59. NOT 8:01. 8:00. ONLY."

There is already a queue of nine students outside.

One of them turns around. You recognize him immediately.

Emeka Okafor. Third-year. Faculty of Social Sciences. The single most infuriatingly prepared human being you have ever met. He carries a planner. A physical, written planner. In this economy.

Emeka: Good morning. You're early. Or — wait. You look panicked. Are you panicked?
You: I'm not panicked.
Emeka: Your shirt is inside out.

You look down. Your shirt is inside out.

Emeka: Don't worry. I've handled worse. You know what I did? I made a checklist last week. Matric card — check. Course form signed — check. Read all 12 chapters — check. Got here at 7:15 for good measure — check.

He shows you his planner. There are colour-coded tabs.

* [Compliment his preparation to pump him for information] -> butter_emeka
* [Tell him what you actually need — maybe he can help] -> honest_emeka
* [Ignore him and wait silently for the office to open] -> ignore_emeka

=== butter_emeka ===
You: Wow, Emeka. That planner is... incredible. You're genuinely the most organized person I know.
Emeka: (visibly pleased) I mean, it's nothing special. Just basic discipline.
You: How did you even know which topics to focus on?
Emeka: The lecturer dropped massive hints in week 9. Figures of speech — especially synecdoche and metonymy — essay structure, and one précis. Anyone paying attention would know.

He realizes what he's done. He has just given you the exam briefing.

Emeka: I— you're not paying attention in class, are you.
You: Not even a little.

~ emeka_score = emeka_score - 1
~ total_xp = total_xp + 20
(You extracted valuable intel. Synecdoche, metonymy, essay structure, précis. Mental note made.)

-> admin_wait

=== honest_emeka ===
You: Emeka, I'll be honest. I have no matric card, no notes, and my course form isn't signed. Help me.

He stares at you for a long moment.

Emeka: ...How are you still enrolled at this university?
You: Audacity, bro. Pure audacity.
Emeka: (sighs) The lecturer emphasized figures of speech heavily. Especially synecdoche and metonymy. That's all I'll say.

He closes his planner firmly. He has given you a lifeline and he knows it.

~ emeka_score = emeka_score - 1
~ grace_rep = grace_rep + 1
~ total_xp = total_xp + 15

-> admin_wait

=== ignore_emeka ===
You stand in silence. Emeka tries to start conversation twice. You respond with minimum syllables.

He eventually opens his planner and pretends to review it smugly.

~ emeka_score = emeka_score + 1
(Emeka is slightly ahead of you mentally today. You'll need to catch up.)

-> admin_wait

=== admin_wait ===
At 8:00 AM precisely, Mr. Gbenga unlocks the admin office door and the queue rushes forward.

-> admin_block_main

// ============================================================
// MAMA BISI'S BUKA — THE SPIRITUAL REFUELING STATION
// ============================================================
=== mama_bisi ===

# image_buka
📍 MAMA BISI'S BUKA — BESIDE NNAMDI AZIKIWE HALL
⏰ 7:21 AM

The buka is already running at full capacity. Mama Bisi herself stands behind a table of legendary proportions, manning three pots, a fryer, and a small speaker playing Fuji music, simultaneously.

She is, without question, the most powerful person on this campus.

The smell of puff puff hits you like a warm hug from a rich aunty. It is golden. It is perfect. It is calling your name.

Mama Bisi: Ekaaro, my customer! You want food or you want trouble?
You: Both, somehow. I need food, Mama Bisi, and I need to charge my phone. I only have 200 naira total.

She sizes you up in exactly 0.4 seconds.

Mama Bisi: Charger is 100 naira. One wrap of puff puff is 50. You'll have 50 left — don't spend it on foolishness.

You notice someone at the far corner charging three phones connected to a power strip. It's Emeka. Of course it's Emeka. He got here first. He has a power bank too, just in case.

Emeka: (waving cheerfully) Good morning!
You: (through gritted teeth) Morning.

* [Pay for both — charge phone and eat puff puff. (Cost: 150 naira)] -> puff_puff_and_charge
* [Just eat. Notes are more important than battery. (Cost: 50 naira)] -> just_puff_puff
* [Just charge. Information is power. (Cost: 100 naira)] -> just_charge
* [Negotiate — offer to carry plates for a free meal + charge] -> negotiate_mama_bisi

=== negotiate_mama_bisi ===
You: Mama Bisi. I respect you deeply. You are the backbone of this institution. I will wash 20 plates AND carry those gas cylinders I see by the wall in exchange for food and charging. Deal?

She looks at the cylinders. She looks at you. She looks at the cylinders again.

Mama Bisi: Wash 30 plates, carry two cylinders, and sweep that corner.

Twelve minutes later, you have completed more physical labour before 8 AM than in the past three months combined.

~ puff_puff_eaten = true
~ phone_battery = 18
~ total_xp = total_xp + 35
(Full battery boost! Puff puff energy activated! And you spent nothing!)

Mama Bisi: (impressed) You work hard when your back is against the wall. You'll be fine today.
You: I work hard when I have no other choice.
Mama Bisi: That's the same thing, my son.

-> admin_block_main

=== puff_puff_and_charge ===
~ naira = naira - 150
~ puff_puff_eaten = true
~ phone_battery = 22
~ total_xp = total_xp + 20

You eat three pieces of puff puff standing up. Each one is a religious experience.

Something in your brain lights up. Glucose. Hope. The will to survive this day.

Your phone charges to 22%. A war chest. You're ready.

-> admin_block_main

=== just_puff_puff ===
~ naira = naira - 50
~ puff_puff_eaten = true
~ total_xp = total_xp + 10

You eat. Your soul re-enters your body.

But your phone stays at 5%. You'll need to be strategic about who you call today.

-> admin_block_main

=== just_charge ===
~ naira = naira - 100
~ phone_battery = 20

Your phone climbs to 20%. You do not eat. Hunger is temporary. Failure is permanent.

A proverb your father never said, but should have.

-> admin_block_main

// ============================================================
// ACT 2 — FACULTY ADMIN BLOCK (MR. GBENGA)
// ============================================================
=== admin_block_main ===

# image_admin
📍 FACULTY OF ARTS ADMIN BLOCK  
⏰ 8:05 AM

The admin block is chaos organized into a queue. Seventy-three students, some of whom have clearly been here since before your alarm was supposed to go off, snake around the corridor.

Mr. Gbenga is already behind his desk. He is a man of approximately 55 years who has processed more student crises than any one human should have to. He does this with the calm of someone who has seen all 400 levels of student nonsense and is no longer impressed.

He calls each student with: "Next. NEXT. Is it that hard? The word is 'NEXT.'"

You reach the counter.

Mr. Gbenga: Matric card.

{ matric_card:
    You produce your card confidently.
    Mr. Gbenga actually looks mildly impressed.
    Mr. Gbenga: Good. Most of them come here with nothing. Name?
    -> gbenga_has_card
- else:
    You: I... don't have it on me, sir.
    Mr. Gbenga: *removes glasses. replaces them.* Today.
    You: Today, sir.
    Mr. Gbenga: Exam day.
    You: Exam day, sir.
    -> gbenga_no_card
}

=== gbenga_has_card ===
Mr. Gbenga types with speed reserved for a man who knows exactly what he's doing.

Mr. Gbenga: Course form?
You: Not yet signed, sir. I need the temporary slip to see my lecturer—
Mr. Gbenga: HOD is unavailable. Substitute is Mr. Alhaji Biodun. Office 14. Third floor. Do not, I repeat, do not interrupt him before he finishes breakfast.
You: It's almost 8:30—
Mr. Gbenga: Mr. Biodun eats two breakfasts. Move.

He stamps your entry slip.

~ total_xp = total_xp + 40
~ gbenga_rep = gbenga_rep + 2
# item_entry_slip
# xp_40

-> alhaji_block

=== gbenga_no_card ===
Mr. Gbenga: And what would you like me to do about that?
You think fast.

* [Beg him with your full chest — make it emotional] -> gbenga_beg
* [Claim the Dean of Students sent you personally] -> gbenga_lie
* [Offer him your last naira as a "processing fee"] -> gbenga_bribe
* [Show him your student portal on your phone] -> gbenga_portal

=== gbenga_bribe ===
{ naira >= 200:
    You slide your last 200 naira across the counter.

    The office goes slightly quiet.

    Mr. Gbenga looks at the money. He looks at you. He looks at the money again.

    Mr. Gbenga: Two hundred naira. You are offering me two hundred naira.
    You: Sir, for processing—
    Mr. Gbenga: I have worked in this university for twenty-two years. My salary is thirty-two thousand naira a month. I have processed 40,000 student forms. I have a Master's degree in Public Administration. And you are offering me two hundred naira.

    He slides the money back. His face does not change.

    Mr. Gbenga: Beg me. Properly.

    ~ naira = naira - 0
    -> gbenga_beg
- else:
    You do not have enough. You already know this.
    -> gbenga_beg
}

=== gbenga_portal ===
{ phone_battery > 3:
    You open your phone and show him your student portal — your name, department, and matric number are all there.

    Mr. Gbenga peers at the screen through his glasses.

    Mr. Gbenga: Hmm. Is this your real face?
    You: Sir, I've just been going through a difficult semester. Existentially.

    He looks at the photo. He looks at you. Your photo is from year one orientation. You were wearing a full ironed shirt. You looked hopeful.

    Mr. Gbenga: ...What happened to you?
    You: UI happened, sir.

    Something almost resembling sympathy crosses his face.

    Mr. Gbenga: Temporary entry slip. Don't embarrass us.
    ~ gbenga_rep = gbenga_rep + 1
    ~ total_xp = total_xp + 30
    # item_entry_slip
    -> alhaji_block
- else:
    Your phone dies as you reach for it.
    You: ...
    Mr. Gbenga: ...
    -> gbenga_beg
}

=== gbenga_lie ===
You: The Dean of Students sent me directly, sir. He said you should process my form urgently.

Mr. Gbenga clasps his hands slowly.

Mr. Gbenga: The Dean of Students.
You: Yes, sir.
Mr. Gbenga: Prof. Adeyemi.
You: Yes, sir.
Mr. Gbenga: Who is currently in Abuja at the NUC conference.
You: ...
Mr. Gbenga: Since Monday.
You: ...I meant the Deputy Dean.
Mr. Gbenga: Also in Abuja. They carpooled.

He leans forward.

Mr. Gbenga: But I appreciate your confidence. That's rare. Most students just cry.

A beat.

Mr. Gbenga: Sit over there. When my queue clears, I'll process your temporary slip. You'll owe me nothing except to never try that again.

~ gbenga_rep = gbenga_rep + 1
~ total_xp = total_xp + 25
# item_entry_slip
(You wait 14 minutes. It feels like 14 years.)

-> alhaji_block

=== gbenga_beg ===
You take a breath.

You: Sir. My NEPA cut light. My alarm didn't ring. My matric card is at the SUG building and it doesn't open until nine. I woke up late. I have an exam in less than two hours for a course I need to pass to maintain my scholarship status. I have nobody to call, no backup plan, and I am standing in front of you because you are genuinely my last option.

You pause.

You: Please, sir.

Mr. Gbenga is quiet for seven full seconds.

Mr. Gbenga: Did you say scholarship?
You: Yes, sir.
Mr. Gbenga: NEPA cut?
You: Since midnight.
Mr. Gbenga: (typing begins accelerating) I have been managing this office on inverter power I bought myself since 2017. NEPA has never stopped me.

He doesn't look up.

Mr. Gbenga: But I understand what it is to fight with your back against the wall.

He slides a temporary entry slip across to you. Your two-years-ago photo is somehow fetched from the system. You looked better then. You looked like you had slept.

~ gbenga_rep = gbenga_rep + 2
~ total_xp = total_xp + 40
# item_entry_slip
# xp_40

-> alhaji_block

// ============================================================
// ACT 2B — MR. ALHAJI BIODUN (THE COURSE FORM BOSS)
// ============================================================
=== alhaji_block ===

📍 LECTURER'S BLOCK — OFFICE 14, THIRD FLOOR
⏰ 8:38 AM

Three floors of stairs. You take them two at a time.

Office 14. The door is slightly open. The smell of eba and egusi soup drifts into the corridor at 8:38 in the morning.

Mr. Alhaji Biodun is a large man in a pristine white kaftan. He is eating eba from a cooler with the serenity of a man who has made peace with all earthly timelines. He does not look up when you knock.

Mr. Alhaji Biodun: Alhaji is eating. Come back when Alhaji has eaten.

You: Sir, I have less than ninety minutes—
Mr. Alhaji Biodun: And Alhaji has eba. Eba also has a timeline. Sit.

You sit. On the chair facing his desk, you notice a nameplate: "MR. BIODUN A.K.A ALHAJI FLAVOUR." Nobody, as far as you know, has ever asked about the "Alhaji Flavour" part.

Emeka appears behind you from nowhere.

Emeka: (cheerfully) Good morning, sir! I'm just collecting my copy of the signed form — you signed it last week when I came early like you recommended.

Alhaji looks up. He smiles.

Alhaji Biodun: Emeka. My most prepared student.

Emeka collects his form, winks at you, and disappears.

~ emeka_score = emeka_score + 2

The eba eating continues.

* [Sit respectfully and wait for him to finish] -> alhaji_wait
* [Compliment the eba. Go all in. Make it art.] -> alhaji_eba_compliment
* [Gently explain that lives are at stake] -> alhaji_explain
* [Desperate move: fake an emergency phone call in the hallway] -> alhaji_fake_call

=== alhaji_wait ===
You wait. You count the seconds. You count the acoustic tiles on the ceiling (there are 47).

After eleven minutes and fourteen seconds, Alhaji Biodun places his spoon down with the satisfaction of a man who has lived well.

Mr. Alhaji Biodun: Now. What do you need, my child?
You: Course form signed, sir. GST 201.
Mr. Alhaji Biodun: Is the content clear to you?
You: ...We'll find out together, sir.

He laughs. A big, warm laugh.

He signs your form with a fountain pen that costs more than your monthly allowance.

~ alhaji_rep = alhaji_rep + 1
~ course_form_stamped = true
~ total_xp = total_xp + 30
# item_signed_form
# xp_30
-> notes_crisis

=== alhaji_eba_compliment ===
You lean forward slightly.

You: Sir, I don't mean to disturb your breakfast — but if I may say, that eba has an extraordinary consistency. The colour is perfect. The texture is... premium. Your wife is a genius, sir, with the greatest respect.

Alhaji Biodun freezes mid-chew. He turns to look at you for the first time.

Mr. Alhaji Biodun: ...You know your eba.
You: I was raised with standards in this area, sir.
Mr. Alhaji Biodun: (quietly) My wife makes it with a specific ratio. Most people cannot identify that ratio simply by observation.

He puts down his spoon.

Mr. Alhaji Biodun: Give me your form.

He signs it not just once but also stamps it with an extra stamp that isn't strictly required, but communicates respect.

~ alhaji_rep = alhaji_rep + 3
~ course_form_stamped = true
~ total_xp = total_xp + 50
# item_signed_form
# xp_50

Mr. Alhaji Biodun: The boy with eba sense. Tell your mates he is different.

-> notes_crisis

=== alhaji_explain ===
You: Sir, I'll be completely honest with you. I woke up late, NEPA cut light, I nearly had to break into the SUG building, I waited in a queue downstairs for 20 minutes, and I climbed three floors to get here. My scholarship depends on this course. I just need a signature, sir. Just one.

He chews thoughtfully.

Mr. Alhaji Biodun: You said NEPA cut?
You: Since midnight, sir.
Mr. Alhaji Biodun: (darkening slightly) They cut mine too. I was watching a match.

He signs the form.

Mr. Alhaji Biodun: NEPA has done enough damage. Go write your exam.

~ alhaji_rep = alhaji_rep + 1
~ course_form_stamped = true
~ total_xp = total_xp + 35
# item_signed_form
# xp_35
-> notes_crisis

=== alhaji_fake_call ===
You step into the corridor, call nobody (your phone may or may not still be on), and begin speaking loudly:

You: What?! The water pipe burst where?! Okay — okay — tell facilities I'm coming! Sir—

You lean back into the office.

You: Sir, I'm so sorry, there's an emergency downstairs, can you please just sign this form quickly—

Mr. Alhaji Biodun: Sit down. There is no emergency. I have heard that exact script eighteen times since 2014. The water pipe, the gas leak, the Dean calling — sit.

He takes your form. He signs it anyway.

Mr. Alhaji Biodun: You have courage. Even if it's the courage of a man with no other options. That's still a form of courage.

~ alhaji_rep = alhaji_rep - 1
~ course_form_stamped = true
~ total_xp = total_xp + 20
# item_signed_form
# xp_20
-> notes_crisis

// ============================================================
// ACT 3 — THE KNOWLEDGE CRISIS
// ============================================================
=== notes_crisis ===

📍 CORRIDOR OUTSIDE OFFICE 14
⏰ 8:56 AM

You have your form. You have your ID.

You do not have one single note for this exam.

Your phone shows:
- 247 unread WhatsApp messages in "BRIGHTFUTURES 2023 🔥💯🙏"
- 14 messages that say "please what's the venue again"
- 1 voice note from somebody quietly crying
- One message from Taiwo: "I'm selling summarized notes. 500 naira. Firm price."
- One message from Grace (a girl from your class you met once during an assignment): "did anyone actually study for this lol"

You have {naira} naira left and approximately 60 minutes before the exam.

* [Sprint to UI Library — grab the textbook yourself] -> ui_library
* [Text Grace — she might actually have notes] -> contact_grace
* [Call Taiwo's bluff — negotiate the notes price] -> taiwo_negotiation
* [Use what Emeka accidentally told you and wing the rest] -> wing_it_path

=== wing_it_path ===
{emeka_score <= 0:
    With Emeka's intel — synecdoche, metonymy, précis, essay structure — and your natural ability to write convincingly about things you half-understand, you feel approximately 45% ready.

    In Nigerian student terms, 45% ready plus exam hall instincts plus prayer equals passing.

    ~ total_xp = total_xp + 15
    -> danfo_journey
- else:
    You never got Emeka's tips. You're going in cold.
    (This is going to hurt.)
    ~ total_xp = total_xp - 10
    -> danfo_journey
}

=== taiwo_negotiation ===
You type: "Taiwo, I have {naira} naira total. That's all I have in this world right now."

A long pause. Three typing bubbles.

Taiwo: lmaooo
Taiwo: okay this is the most honest message I've received today
Taiwo: fine. send me your number let me WhatsApp you the PDF. buy me suya next week.
You: Suya. Done.

He sends a 47-page PDF titled "GST EVERYTHING 2023 FINAL v4 REAL FINAL.pdf"

The document is partially memes. But embedded between the memes are actual notes. Solid notes. Notes that make sense.

You read at the speed of someone whose future is at stake, which is a speed science has not yet measured.

~ notes_found = true
~ total_xp = total_xp + 35
# item_gst_pdf
# xp_35

(You have absorbed approximately 70% of what you need. The remaining 30% you will manufacture during the exam using confidence and creativity.)

-> danfo_journey

=== contact_grace ===
You type to Grace: "Grace please tell me you have notes I'll literally do anything"

She replies in 40 seconds.

Grace: lol
Grace: ...okay yes I have notes
Grace: where are you?

Five minutes later, you are sitting on the steps of the Arts Faculty block while Grace scrolls through a Google Doc so well-organized it looks like a published academic paper. She has headers, subheaders, color coding, and footnotes.

Grace: I colour-coded by exam likelihood. Pink is high chance to come. Yellow is medium. Green is unlikely but possible.

The entire document is pink.

Grace: The entire thing is likely to come, honestly. She's predictable if you've been attending.

You: I've been... attending spiritually.
Grace: (sighs) Okay. You have 45 minutes. Focus on synecdoche, metonymy, onomatopoeia, précis structure, and essay introduction formats. Those are her favourites.

She stays and explains each concept with examples. She uses your campus as the context. She makes you repeat each figure of speech back to her.

You: (repeating) Synecdoche — when a part represents the whole. Like 'all hands on deck' — hands represents people.
Grace: Good. Again.

~ notes_found = true
~ grace_ally = true
~ grace_rep = grace_rep + 3
~ total_xp = total_xp + 55
# item_grace_notes
# xp_55

Grace: You'll be fine. You're actually getting it fast.
You: I get things fast when my scholarship is on the line.
Grace: That's... concerning but okay.

-> danfo_journey

=== ui_library ===

📍 UNIVERSITY OF IBADAN LIBRARY — GROUND FLOOR
⏰ 9:05 AM

One of the largest university libraries in West Africa. Today, it is also one of the most crowded.

Students are packed in every corner. A girl in the corner appears to be hugging a textbook. Two boys near the shelves are whispering to each other with the intensity of generals on a battlefield. Someone is softly crying near the periodicals section. This is normal. This is exam season.

Mr. Banga — the head librarian — stands at the entrance like a customs officer who has seen everything twice.

Mr. Banga: ID and student portal. Sign the register. Legibly. Both names. Last semester someone wrote "Adewale" and it looked like "Adewole" and an entirely different student got fined.

You sign in and head to the Use of English shelf.

One copy of "Comprehensive Use of English" remains.

A hand reaches for it at the exact same moment as yours.

You look up. The hand belongs to Grace — the same Grace from your class who texted you earlier.

You both hold the book simultaneously.

Grace: ...You're the one who texted me.
You: You're the one who has notes.
Grace: I have notes on my phone but the figures of speech charts are only in this book.
You: I literally need this entire book.

* [Suggest speed-reading it together and splitting chapters] -> library_team_up
* [Challenge her to a figure of speech quiz — winner keeps the book] -> library_quiz
* [Beg her with your entire heart] -> library_beg

=== library_beg ===
You: Grace. I need you to know something. I am a good person fundamentally. I am just having the worst morning of my academic career. This book is my last hope. I am begging you with everything I have.

She looks at you.

Grace: ...That's genuinely the saddest thing I've heard today.
You: It gets worse. I just climbed three floors at 8:45 AM after nearly breaking into the SUG building.

A long pause.

Grace: I already know the figures of speech charts. Take the book.

She gives you the book and sits beside you with her phone notes.

~ notes_found = true
~ grace_ally = true
~ grace_rep = grace_rep + 2
~ total_xp = total_xp + 35
# item_textbook
# xp_35

-> danfo_journey

=== library_quiz ===
You: Figure of speech quiz. I ask you one. You ask me one. If I win two rounds, I keep the book. If you win, you keep it and you give me five minutes to photograph the figures of speech pages.

Grace: That's... fair. Weirdly fair. Okay.

Round 1. You ask: "What is the difference between simile and metaphor?"
Grace answers instantly and flawlessly.

Round 2. Grace asks: "Give an example of personification and explain why it's not the same as apostrophe."
You take 8 seconds. You get it right. Barely. But right.

Round 3. Sudden death. She asks: "What is synecdoche?"
You remember Emeka. You remember Grace's own text earlier.

You: When a part of something represents the whole — or the whole represents a part. Like saying 'the crown' to mean the king, or 'all hands on deck' to mean all people.

Grace: (long pause) ...You've been studying.
You: I've been surviving.

She gives you the book.

~ notes_found = true
~ grace_ally = true
~ grace_rep = grace_rep + 3
~ total_xp = total_xp + 50
# item_textbook
# xp_50

-> danfo_journey

=== library_team_up ===
You: Let's split it. I take chapters 1 and 4 — figures of speech and essay writing. You take chapters 2 and 3 — precis and comprehension. We read, then brief each other. Twenty minutes. Speed run.

Grace: I normally work alone.
You: So do I until I don't have a choice.
Grace: ...Fine. Timer starts now.

You read at the speed of genuine desperation. Grace reads with focused efficiency. When the timer ends, you brief each other in clipped, fast volleys.

Grace: Précis — one-third length, third person, no direct speech—
You: Figures of speech — synecdoche, metonymy, onomatopoeia — she loves those three.
Grace: Essay — introduction contains thesis, three supporting points, logical conclusion—
You: Got it. Can I photograph these pages?
Grace: Already sent them to your number.

~ notes_found = true
~ grace_ally = true
~ grace_rep = grace_rep + 3
~ total_xp = total_xp + 60
# item_grace_notes
# xp_60

-> danfo_journey

// ============================================================
// ACT 4 — THE DANFO AND THE TWIST
// ============================================================
=== danfo_journey ===

# image_danfo
📍 UI MAIN GATE — BUS STOP
⏰ 9:44 AM

Alexander Brown Hall. Other side of campus. Sixteen minutes until it's too late to enter.

At the UI main gate, four danfo buses are being loaded with the kind of controlled chaos that is unique to Nigerian transportation. The conductor — a short, immovable man the students call Agbero — is directing the loading process like a traffic conductor at the world's noisiest orchestra.

Agbero: Oya enter! Enter! No standing in doorway! Put your bag inside! Sir your bag is a person it needs a ticket! ENTER!

The buses are already full. He is still inviting people to enter.

You: How much to Alexander Brown Hall?
Agbero: One hundred naira. Standing charge is fifty. Total one-fifty.

{ naira >= 150:
    * [Pay 150 naira and squeeze in] -> pay_danfo
    * [Negotiate — you're only going two stops] -> negotiate_danfo
    * [Run. You can make it.] -> run_to_abh
- else:
    * [Negotiate — you don't have enough] -> negotiate_danfo
    * [Run. You literally have no choice.] -> run_to_abh
}

=== negotiate_danfo ===
You: Bros, I'm a student. Final two stops. I have {naira} naira.

Agbero looks at you with the eyes of a man who has heard every variation of this exact speech.

Agbero: You're a student going to an exam?
You: Yes.
Agbero: Today?
You: In fifteen minutes.
Agbero: And you're here negotiating transport instead of running?

A pause.

Agbero: I respect the calm. Enter. Pay me what you have.

~ naira = 0
~ danfo_survived = true
~ total_xp = total_xp + 15
-> danfo_ride

=== pay_danfo ===
~ naira = naira - 150
~ danfo_survived = true
-> danfo_ride

=== danfo_ride ===
You squeeze into the danfo. It is a spatial miracle. There are fourteen people in a bus built for ten. A woman near the window is holding a live chicken — the chicken appears unbothered, which says a lot about the chicken's character. Two students behind you are reciting figures of speech to each other at speed. One man near the driver is eating a meat pie with the calm of someone who has no exam today and never will.

The driver starts the engine. It takes three attempts. On the third, it catches, splutters, and decides to live.

You are moving.

For exactly forty-five seconds, everything is fine.

Then your phone buzzes.

It's the class WhatsApp group. It's been buzzing for three minutes straight. You open it.

📲 BRIGHTFUTURES 2023 🔥:
- "Guys has anyone seen the notice board??"
- "VENUE HAS BEEN CHANGED"
- "No wait which venue"
- "ABH is under maintenance! Exam moved to TRENCHARD HALL"
- "TRENDCHAAAAAARD??"
- "Someone confirm this abeg"
- "I'm already at ABH, is this real???"
- "Mrs Balogun herself posted it in the department group"
- "TRENCHARD HALL GUYS TRENCHARD HALL"

Trenchard Hall. The grand old auditorium near the Vice-Chancellor's office. On the opposite side of campus from where you are currently heading.

The danfo is going the wrong direction.

* [Bang on the roof — emergency stop, get off now!] -> emergency_exit_danfo
* [Calmly tell the conductor you need to reroute] -> reroute_politely
* [Decide to run from ABH — it can't be THAT far to Trenchard] -> run_from_abh

=== run_from_abh ===
You stay in the danfo. You reach ABH. Then you run.

You run past the Benue Hall roundabout, past Freedom Square, past the Trenchard Hall clock (showing 9:47, which is either correct or wrong — you have never seen it show the right time and you don't intend to test it now).

You arrive at Trenchard Hall at 9:57 AM.

You are wheezing. Your shirt is definitely inside out. But you are here.

~ danfo_survived = true
~ total_xp = total_xp + 20
-> venue_arrival

=== emergency_exit_danfo ===
You bang on the bus roof three times with a fist.

The danfo stops immediately. Agbero appears at the door.

Agbero: Who is—
You: Exam relocated to Trenchard Hall. Wrong direction. I need to get off.

Agbero looks at you. He looks at the road. He looks back at you.

Agbero: My brother. RUN.

You run. You run through Freedom Square. You run past a group of lecturers who watch you sprint by with the resigned expressions of people who have seen this every semester. You see Emeka — Emeka! — already walking calmly toward Trenchard Hall at a speed that suggests he knew about the venue change yesterday.

Emeka: (genuinely surprised) You're still going to make it?
You: (still running) You had. Better. Not. Have known. About this. Yesterday.
Emeka: I checked the notice board Wednesday. Always check the notice board.

You resist the urge to slow down and argue with him.

You arrive at Trenchard Hall at 9:53 AM.

~ danfo_survived = true
~ total_xp = total_xp + 30
-> venue_arrival

=== reroute_politely ===
You tap Agbero on the shoulder.

You: Bros abeg. Exam venue changed. I need Trenchard Hall, not ABH.

He looks at you. He looks at the road.

Agbero: My route doesn't pass Trenchard.
You: I know.
Agbero: ...You have legs?
You: I have legs.
Agbero: Use them at the next stop. I won't charge you.

He drops you two stops early. You run the remaining distance at the speed of someone who has genuinely run out of options.

You arrive at Trenchard Hall at 9:55 AM.

~ danfo_survived = true
~ total_xp = total_xp + 25
-> venue_arrival

=== run_to_abh ===
You run. You run before any of this is resolved.

You have been running since 7 AM in various metaphorical and now literal senses.

You reach Alexander Brown Hall at 9:50 AM.

The gate is locked. A sign in Mrs. Balogun's handwriting (you recognize it from returned assignments) reads: "EXAM RELOCATED TO TRENCHARD HALL. CHECK THE NOTICE BOARD. WE HAVE BEEN TELLING YOU."

You run to Trenchard Hall.

You arrive at 9:59 AM.

~ total_xp = total_xp + 10
-> venue_arrival

// ============================================================
// ACT 5 — TRENCHARD HALL — THE EXAM
// ============================================================
=== venue_arrival ===

# image_exam
📍 TRENCHARD HALL, UNIVERSITY OF IBADAN
⏰ (Cutting it close either way)

Trenchard Hall is one of the most iconic buildings on the UI campus. Its big arched windows and aged stone walls have witnessed decades of student achievement, heartbreak, convocation joy, and exactly this kind of last-minute exam panic.

Today it smells of anxiety, morning dew coming through those old windows, and someone's Indomie from a bag they're quietly eating in the back row.

Mrs. Balogun stands at the entrance like a monument to academic order. She has done this for 19 years. She has seen everything. She is immune to everything.

She examines each student with the efficiency of airport security and the suspicion of someone who once caught a student with a textbook taped to their thigh.

You reach her.

Mrs. Balogun: Matric card or temporary entry slip.

You produce your documentation.

She examines your face. She examines your photo. She examines your face again.

Mrs. Balogun: You look like you've been through something.
You: I've been through several things, ma.
Mrs. Balogun: (returning your documents) Section C, row 4.

You find your seat.

The exam paper is placed face-down in front of you.

You look around. Emeka is three rows ahead, sitting with the calm of a man who has already meditated this morning. He arranged his pens by length. Grace is four seats to your left. She catches your eye and gives a small nod.

You look at your hands. They are slightly shaking — either from the run, the puff puff sugar crash, the 5% phone battery ambient anxiety, or the cosmic weight of this moment.

The bell rings.

Every student in Trenchard Hall flips their paper at the same time.

The hall goes silent.

* [Take 30 seconds to read the whole paper before writing anything] -> read_first_strategy
* [Answer what you know first — build momentum] -> confident_start
* [Open the paper and begin writing immediately — pure instinct] -> instinct_mode

=== read_first_strategy ===
You scan the paper top to bottom.

Section A: Comprehension passage. Fine.
Section B: Identify and explain 6 figures of speech from the passage. Your eye immediately finds a synecdoche AND an example of onomatopoeia in paragraph two.
Section C: Précis. Write a summary of the passage in 80–100 words in third person.
Section D: Essay. "Discuss the challenges facing Nigerian university students today."

You almost laugh out loud at Section D. You have been living Section D since 7 AM this morning.

You begin writing with structured, calm confidence.

~ total_xp = total_xp + 30
-> exam_performance

=== confident_start ===
You go straight to Section B: Figures of Speech. The passage is rich with them — metonymy, synecdoche, personification, onomatopoeia. You name them and explain them cleanly.

Section D: Essay on Nigerian student challenges. You write from lived experience. You describe NEPA, admin queues, danfo buses, the frantic energy of campus life. It reads like journalism. Like a confession. Like both.

The writing flows.

~ total_xp = total_xp + 25
-> exam_performance

=== instinct_mode ===
You begin immediately. No strategy. Pure survival mode writing.

Some of it is exactly right. Some of it is creative interpretation. You define synecdoche as "when you say one thing to mean everything" which is not textbook but is not entirely wrong. You write the essay in one long, unbroken stream of consciousness about your morning.

~ total_xp = total_xp + 15
-> exam_performance

// ============================================================
// ACT 5B — COMPLICATIONS
// ============================================================
=== exam_performance ===

You are in the zone. Words are flowing. The figures of speech section is going well — the ones Grace reviewed with you are here, exactly as she predicted.

Twenty minutes in, something happens.

A hand taps your shoulder.

You look sideways. The student next to you — a girl you vaguely recognize from the Social Sciences faculty — is holding a tiny folded piece of paper under the desk. She is extending it toward you. She mouths: "Précis structure?"

Mrs. Balogun is walking the aisle in your direction.

* [Take the note quickly and help her out] -> take_the_note
* [Shake your head firmly and focus on your paper] -> refuse_the_note
* [Pretend you didn't see it — look straight ahead] -> ignore_the_note

=== take_the_note ===
You take it. It crinkles. You've written down the précis structure when—

Mrs. Balogun: You. Stand up.

The entire hall looks.

Mrs. Balogun: What is in your hand?
You: It's not — I was just—
Mrs. Balogun: Put it on the desk. Both of you.

She examines the note. A tiny strip of paper with "précis = 3rd person, past tense, 1/3 length" written on it.

Mrs. Balogun: You know the rules.

~ caught_cheating = true
~ total_xp = total_xp - 20
# xp_-20

Mrs. Balogun: I am recording this. You finish the exam. But this incident goes to my report.

She walks away. The hall resumes.

Your hands are shaking harder now.

-> exam_finale

=== refuse_the_note ===
You shake your head. She looks disappointed. Mrs. Balogun passes without incident.

~ total_xp = total_xp + 10
(You stayed clean. Your conscience and your exam script are both untainted.)

-> exam_finale

=== ignore_the_note ===
You stare straight ahead. The note remains extended for seven awkward seconds. Then it disappears.

Mrs. Balogun passes. No one is caught. You feel slightly guilty for not helping but also entirely unbothered.

-> exam_finale

=== exam_finale ===
The final bell rings.

Mrs. Balogun: Pens down. Do NOT write after the bell. I will watch you put your pens down.

Twelve students attempt to write one more word. She watches all twelve of them with the precision of a hawk.

You place your pen down cleanly. Your paper is complete. Or at least — it is done.

She collects from your row. She takes your script. She doesn't look at you.

Mrs. Balogun: (quietly, only to you) You made it on time.
You: Yes, ma.
Mrs. Balogun: Good.

That's all she says.

-> endings_gateway

// ============================================================
// ENDINGS
// ============================================================
=== endings_gateway ===

Outside Trenchard Hall, students spill into the afternoon sun.

Some are laughing. Some are sitting on the steps staring into the middle distance. One boy is on the phone describing a question that "just didn't make sense, I swear." One girl is crying in a way that somehow also looks happy.

Emeka appears beside you.

Emeka: How did it go?
You: I think I passed.
Emeka: Synecdoche — what kind came up?
You: "All hands on deck" in paragraph three.
Emeka: (nodding) Classic. You got it though?
You: I got it.

He looks at you for a second with something that is not quite respect but is maybe in that direction.

Emeka: You had nothing going into today.
You: I had audacity.
Emeka: (small smile) That's a resource.

{grace_ally:
    Grace finds you on the steps.
    Grace: How'd it go?
    You: The figures of speech section — your prep absolutely saved me.
    Grace: (trying not to smile) Okay, that's actually nice to hear.
    You: Can I buy you puff puff? I owe Seun money too but you outrank him.
    Grace: You don't have any money.
    You: I have ambition.
    Grace: ...Next time just come to class.
}

{
    - caught_cheating && notes_found && course_form_stamped: -> caught_but_tried_ending
    - caught_cheating: -> rough_ending
    - notes_found && course_form_stamped && matric_card && grace_ally && danfo_survived: -> legendary_ending
    - notes_found && course_form_stamped && matric_card: -> solid_ending
    - notes_found && course_form_stamped: -> good_enough_ending
    - notes_found: -> bare_minimum_ending
    - else: -> chaos_ending
}

=== legendary_ending ===
You pull out your dead phone and stare at the blank screen.

In the past four hours you have: nearly broken into a government building, extracted exam intel from a rival through psychological warfare, had eba explained to you as a philosophical concept, survived a danfo reroute, run across campus in the wrong direction, found an unlikely study ally, and written 1,400 words in 90 minutes about the Nigerian student experience — from lived experience, experienced today.

Your phone screen stays black.

Seun calls from a friend's phone.

Seun: Bross! You wrote?
You: I wrote it.
Seun: All of it?
You: All of it.
Seun: The figures of speech section?
You: Synecdoche, metonymy, onomatopoeia, personification, irony, and — you won't believe this — litotes.
Seun: ...What is litotes?
You: Understatement. "It's not nothing." Something about my morning wasn't nothing.

You sit on the Trenchard steps and look out at the sprawling, chaotic, beautiful UI campus.

This place will break you ten times. You will always find a way back.

🏆 ENDING: CAMPUS LEGEND
"You arrived with nothing and left with everything."
XP Earned: {total_xp + 100} total
Achievement Unlocked: The Unstoppable Nigerian Student
Next Episode: "FRESH NIGHT" — Cult rumours, a missing laptop, and a girl named Sade who knows too much.

~ total_xp = total_xp + 100
# achievement_campus_legend
-> DONE

=== solid_ending ===
You sit on the steps outside Trenchard as students stream past.

It wasn't perfect. Nothing about today was perfect — from the alarm that didn't ring to the danfo that tried to go the wrong way to the exam paper that asked about litotes (you guessed on that one).

But your form was signed. Your ID was valid. Your notes, though gathered in a hurricane, held.

You put 70% of yourself on that paper.

Sometimes 70% is everything you have.

🎓 ENDING: STEADY HUSTLE
"Not every win looks like a win from the outside."
XP Earned: {total_xp + 70} total
Achievement Unlocked: The Reliable One
Next Episode: "FRESH NIGHT" — Cult rumours, a missing laptop, and a girl named Sade who knows too much.

~ total_xp = total_xp + 70
# achievement_steady_hustle
-> DONE

=== good_enough_ending ===
You didn't get your matric card. Mrs. Balogun let you in on the temporary slip, but it went into her report. You'll receive a letter next week about it.

But you wrote the exam. You answered Section B with confidence because Grace's notes were solid. The précis was rough. The essay was raw and personal.

Sometimes surviving is its own kind of grade.

🎓 ENDING: THE RESILIENT ONE
"Everything was against you. You went anyway."
XP Earned: {total_xp + 60} total
Achievement Unlocked: Against All Odds
Next Episode: Coming soon.

~ total_xp = total_xp + 60
# achievement_resilient
-> DONE

=== bare_minimum_ending ===
You wrote the exam.

Was it your best? No.
Did you have your full notes? No.
Did you have your full ID? Depends which angle you look at it from.

But you were physically present in that hall when that paper was placed in front of you. And for 90 minutes, you gave it everything you had.

The campus doesn't always reward the best prepared. Sometimes it rewards the ones who simply don't stop.

🎓 ENDING: THE SHOW-UP
"Presence is its own kind of preparation."
XP Earned: {total_xp + 40} total
Next Episode: Coming soon.

~ total_xp = total_xp + 40
-> DONE

=== caught_but_tried_ending ===
The note incident is in Mrs. Balogun's report. But you finished the exam. With notes, with a signed form, with your ID. The incident will likely result in a query — a letter, a conversation with a faculty officer, a minor consequence.

But the exam script exists. It is complete. It has your name on it.

You'll deal with the report when it comes. You've dealt with worse today and it's not even 12 PM.

🎓 ENDING: THE COMPLICATED ONE
"Some days leave marks. You carry them anyway."
XP Earned: {total_xp + 35} total
Next Episode: Coming soon.

~ total_xp = total_xp + 35
-> DONE

=== rough_ending ===
Without notes, without full ID, and with the cheating incident on your record — this is going to be a season of consequence management.

The exam script exists. But you're walking away from Trenchard Hall with unfinished business.

This is not over. Nothing on this campus is ever over.

🎓 ENDING: NOT DONE YET
"Even unfinished stories have a next chapter."
XP Earned: {total_xp + 20} total
Next Episode: Coming soon.

~ total_xp = total_xp + 20
-> DONE

=== chaos_ending ===
Something went wrong enough times that you're not entirely sure how this ended. But you were there. You sat down. You looked at the paper.

There is something unbreakably Nigerian about showing up even when you have no real right to expect it to work out.

🎓 ENDING: PURE VIBES
"You had absolutely nothing. You still came."
XP Earned: {total_xp + 15} total
Achievement Unlocked: Audacity Is A Skill
Next Episode: Coming soon.

~ total_xp = total_xp + 15
# achievement_audacity
-> DONE
