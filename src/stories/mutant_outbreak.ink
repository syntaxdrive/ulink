// ============================================================
// UNILINK STORIES — SEASON 1, EPISODE 2
// "THE BUKA OUTBREAK"
// Genre: Serious Horror, Survival, Comedy
// ============================================================

// --- GLOBAL STATE VARIABLES ---
VAR health = 100
VAR stealth = 50
VAR mutant_repellent = false
VAR weapon = "None"
VAR rescued_emeka = false
VAR total_xp = 0

-> outbreak_start

// ============================================================
// ACT 1 — THE AWAKENING
// ============================================================
=== outbreak_start ===
# image_mutant_dorm
📍 ZIK HALL — ROOM 42
⏰ 11:45 PM

The Use of English exam from this morning feels like a lifetime ago. 
After writing arguably the worst essay in UI history, you came back to your hostel and slept for 14 hours straight.

You wake up because something thick and warm is dripping onto your forehead.

You open your eyes. The power is out. Pitch black. The only light comes from the moon outside the window.

Your roommate, Seun, is standing directly above your bed. 
But he is not Seun anymore.

His jaw is unhinged, hanging loosely near his collarbone. Two additional, fleshy arms have burst out of his shoulders, twitching violently. He is drooling a glowing green liquid directly onto your face. 

From outside the window, you hear a terrified scream, followed by the sound of breaking glass. This isn't a football match celebration. You realize with absolute, icy terror—the campus is under attack.

"B-b-brossss..." Seun gurgles, his voice sounding like two stones grinding together. "I need... your... assignment..."

* [Roll out of bed and grab your heavy GST textbook as a weapon!] -> grab_book
* [Stay perfectly still. Maybe his vision is based on movement like a T-Rex.] -> stay_still
* [Scream: "SEUN, DEADLINE HAS PASSED!"] -> bureaucratic_defense

=== grab_book ===
You dive off the mattress, executing an imperfect combat roll into the corner. You grab the heaviest thing in the room: the 800-page "Comprehensive GST Syllabus" textbook.

Seun screeches—a horrific, high-pitched wail that shatters the room's mirror. He lunges at you, all four arms extended, fingers ending in bone-like talons.

You swing the textbook with the might of a man whose life is flashing before his eyes. It connects with his mutated skull. 
There is a sickening CRUNCH.

Seun crashes into the wardrobe. He lies still for a moment, green goo pooling around him.

~ weapon = "GST Textbook"
~ stealth = stealth - 10
# xp_20

(Weapon acquired: The GST Textbook. It is finally useful.)

-> the_hallway

=== stay_still ===
You hold your breath. You do not move a muscle.

Seun leans closer. His mutated, eyeless face hovers inches from your nose. You can smell rotten eggs and cheap cafeteria stew.

He sniffs you. 
You remain still.

Suddenly, a notification rings on your phone. It is a WhatsApp message from your class rep: 
"Pls who has notes for tomorrow?"

Seun roars! He violently swipes at you.

* [Dodge and run for the door!] -> hallway_escape

=== hallway_escape ===
You barely duck as his claws rip through your pillow, sending feathers flying everywhere. You scramble to your feet, kick the door open, and sprint out!

~ health = health - 15
# xp_10

(You took 15 damage from the near miss!)

-> the_hallway

=== bureaucratic_defense ===
You sit up, point your finger at his horrifying, mutated face, and yell:
"SEUN! THE SUBMISSION PORTAL CLOSED YESTERDAY AT MIDNIGHT!"

The mutant freezes. 

The deeply ingrained trauma of Nigerian university bureaucracy overrides his mutant DNA. He clutches his head with all four hands and begins to wail in agony over the missed deadline.

You use his existential crisis to slowly slide off the bed, grab your backpack, and back out the door.

~ stealth = stealth + 20
# xp_30
# achievement_bureaucracy

-> the_hallway

// ============================================================
// ACT 2 — THE CORRIDOR OF HORRORS
// ============================================================
=== the_hallway ===

📍 ZIK HALL — A BLOCK CORRIDOR
⏰ 11:52 PM

The corridor is a nightmare. 

Blood and green slime paint the walls. The flickering emergency lights reveal bodies scattered across the floor. Some are dead. Some are... twitching.
At the end of the hall, you see three mutant students ripping apart a vending machine with their bare, oversized hands.

Your phone buzzes. It's a text from Emeka.
"I am in the Faculty Library. They are outside. The Agricultural Biology department's secret growth serum leaked into Mama Bisi's meat supply. Do not eat the meat. The library is secure for now, but my planner says I need to sleep in 30 minutes. Pls bring snacks."

Emeka is in the library. He understands what caused the outbreak.

If you are going to survive tonight, you need to get out of this hostel, cross the campus in the dark, and reach the Library.

You sneak down the stairs toward the dark exit lobby. The air is thick. 

As you reach the ground floor, a massive shadow steps in front of the exit doors.

# image_mutant_porter
It's the Hall Porter. 
Or, what used to be the Hall Porter. He has mutated into a hulking, 7-foot monstrosity. His muscles have torn through his uniform. But despite the terrifying transformation, he is still strictly pointing at the "SHOW YOUR ID CARD BEFORE EXITING" sign on the wall. 

He growls, his voice rumbling like an earthquake. "I... D... CAARRDD!!!"

* [Show him your ID card respectfully.] -> show_id
* [Try to sneak past him while he's distracted.] -> sneak_porter
* {weapon == "GST Textbook"} [Hit him with the book and run!] -> smash_porter

=== show_id ===
You slowly, carefully reach into your pocket. Your hands are shaking. You pull out your laminated ID card and raise it up.

He leans down. He has one giant, bulging eye right in the middle of his forehead. He stares at the card. He looks at your face. He looks at the card again.

The mutant shakes his head, points a massive claw at your clothes, and growls: "NOT... DRESS... CODE..."

He swings his massive fist!

* [Dodge roll!] -> porter_combat

=== sneak_porter ===
You crouch low. You try to use your stealth to slip behind his massive desk while he is staring at the door.

{ stealth >= 60:
    You move like a ghost. He doesn't even notice as you slip through the cracked glass doors and step out into the terrifying night.
    ~ stealth = stealth + 10
    # xp_40
    -> campus_grounds
  - else:
    You step on a piece of broken glass. The crunch echoes loudly.
    The mutant porter snaps his head around. He roars!
    -> porter_combat
}

=== smash_porter ===
You grip the GST textbook with both hands, let out a battle cry, and sprint at the 7-foot mutant!

You leap into the air and smash the heavy textbook directly into his giant, single eye!

He screams in pain, stumbling backward and crashing into the porter's desk, bringing the entire wooden structure down on top of himself.

"KNOWLEDGE IS POWER, DEMON!" you yell, sprinting through the front doors.

~ health = health - 10
# xp_50

-> campus_grounds

=== porter_combat ===
He swings! The blow clips your shoulder, sending you flying across the lobby. You crash into the notice board. 

~ health = health - 40

You scramble to your feet, coughing blood, and dive through the shattered front window, sprinting into the darkness of the campus as the mutant roars behind you!

-> campus_grounds

// ============================================================
// ACT 3 — THE OUTBREAK
// ============================================================
=== campus_grounds ===
# image_mutant_cafeteria
📍 CAMPUS GROUNDS — THE DARKNESS
⏰ 12:15 AM

The campus is unrecognizable. Fires burn near the faculty buildings. In the distance, you can hear the horrifying screeches of mutant students hunting in packs. 

You hide behind a large oak tree. 

Suddenly, a dark figure drops from the branches above you and lands silently right in front of your face. 

You almost scream, but a hand covers your mouth.

"Shh," a voice whispers. 

It's Grace. She's wearing all black, holding a sharpened mop stick like a spear, and has war paint made of what looks like printer toner smeared across her cheeks.

"They react to sound and the smell of fear," she whispers, her eyes darting around. "And also the smell of unsubmitted assignments for some reason. The Agricultural department messed up big time."

You: "Grace? You look like you've been fighting in a war for ten years. It's been exactly two hours since the exam."
Grace: "Anxiety makes you adaptable. Come on. If we want to reach the library, we have to cut through Mama Bisi's Buka. That's ground zero. Are you ready?"

* [I am ready. Let's kill some mutants.] -> buka_siege
* [Absolutely not. Is there another way?] -> buka_coward

=== buka_coward ===
You: "Grace, I am not going to ground zero. Are you crazy?"
Grace: "The other path goes through the Engineering faculty. The engineering students mutated into cyborg-zombies. They have literal soldering irons for hands."

You: "...Mama Bisi's Buka it is."

-> buka_siege

=== buka_siege ===

📍 MAMA BISI'S BUKA (GROUND ZERO)
⏰ 12:35 AM

You and Grace creep toward the cafeteria area. It is heavily infested.

Dozens of bloated, horrifying mutants are gathered around the massive cooking pots, violently tearing into the leftover contaminated meat. The sounds of their feeding are sickening. 

"We need a distraction," Grace whispers. "If we throw something loud over there, we can sneak through the back door."

* [Throw your phone. (Warning: It will break)] -> throw_phone
* [Sneak quietly without a distraction.] -> sneak_buka
* [Yell "FREE WIFI AT THE SU BUILDING!" as a distraction] -> yell_wifi

=== throw_phone ===
It hurts your soul, but survival is more important. You throw your phone as hard as you can toward the far end of the cafeteria. 

It shatters against the wall. The flashlight blinks rapidly.

Immediately, twenty mutants screech and scurry toward the light like horrifying spiders. The path is clear!

You and Grace sprint through the back door and secure it behind you.

# xp_50
-> library_entrance

=== yell_wifi ===
You cup your hands around your mouth and yell with everything you have:
"FREE UNLIMITED WIFI AT THE STUDENT UNION BUILDING! NO PASSWORD!"

The mutants freeze. Their feeding stops. 
Even in their horribly mutated, slime-dripping state, the biological urge for free campus WiFi remains supreme.

The entire horde screeches and begins running frantically toward the Student Union building in the distance. 

Grace looks at you, genuinely terrified of your genius. 
Grace: "That was the smartest thing I have ever seen."

# xp_75
# achievement_wifi_bait
-> library_entrance

=== sneak_buka ===
You try to sneak past them. You hold your breath, walking step-by-step behind the serving counters.

You step on a stray piece of crunchy puff-puff.

CRUNCH.

Every single mutant stops eating. Slowly, twenty horrifying, bloated faces turn to look at you.

Grace: "Run."

You both sprint for your lives as the horde gives chase! One of them slashes your back as you dive through the door!

~ health = health - 50
{ health <= 0:
    -> death
}

You slam the heavy metal door shut, locking them out. You are bleeding heavily.

-> library_entrance

// ============================================================
// ACT 4 — THE FINAL STAND
// ============================================================
=== library_entrance ===
# image_mutant_boss
📍 KENNETH DIKE LIBRARY (KDL) — ENTRANCE
⏰ 1:05 AM

You and Grace arrive at the massive glass doors of the library. They are barricaded from the inside with desks and chairs.

You bang on the glass. "Emeka! Let us in!"

Emeka's face appears behind the glass. He looks completely calm. He is holding his planner.
Emeka: "Are you bitten? My schedule doesn't accommodate a zombie infection until 3:00 AM."

Before you can answer, the ground shakes. 

A massive shadow falls over you.

You turn around. 

The Library Boss Mutant. It is massive. Bloated beyond recognition, towering at ten feet tall, carrying an entire concrete pillar as a club. It lets out a roar that shatters the windows on the second floor.

Emeka frantically starts clearing the barricade, but it's going to take time. You and Grace have to hold this monster off!

"I only have one strategy left!" Grace yells, throwing her spear to you.

* [Attack the beast's legs to slow it down!] -> boss_legs
* [Let the beast hit you so Grace can ambush it!] -> boss_sacrifice
* {weapon == "GST Textbook"} [Read the GST Textbook to it to bore it to sleep!] -> boss_gst

=== boss_legs ===
You dive low, slicing the spear across the mutant's massive, bloated ankles. 

It roars in pain, dropping to one knee! But its massive club swings wildly, barely missing your head. 

Emeka kicks the door open! "Inside! NOW!"

You and Grace scramble inside just as the monster smashes the ground where you were standing. Emeka locks the reinforced security doors.

-> ending_survivors

=== boss_sacrifice ===
You stand your ground, yelling at the beast to draw its attention. 

It swings its massive pillar. It hits you squarely in the chest. You hear ribs crack as you are thrown through the air, landing violently on the concrete steps.

~ health = health - 80

{ health <= 0:
    -> death_hero
}

But the distraction works! Grace leaps from the staircase, driving her spear directly into the back of the monster's neck. It falls, paralyzed. 

Emeka drags your broken body through the doors. 

-> ending_survivors

=== boss_gst ===
You open the Comprehensive GST Syllabus. 
"CHAPTER FIVE!" you yell, your voice echoing in the night. "THE ORIGINS OF WEST AFRICAN TRADE ROUTES IN THE PRE-COLONIAL ERA!"

The giant mutant pauses. 

You read louder. "Sub-section A: The socio-economic implications of the trans-Saharan exchange methodologies..."

The monster drops its club. Its single giant eye begins to droop. The paralyzing boredom of the Use of English and GST curriculum is a weapon stronger than any physical damage.

It sits down. It yawns. 
And then, horizontally, it passes out.

Grace and Emeka stare at you in absolute disbelief. 

Emeka opens the door. "Remind me never to mess with you."

# achievement_academic_weapon
# xp_100

-> ending_survivors

// ============================================================
// ENDINGS
// ============================================================
=== death ===
You sustain too much damage. The mutants drag you into the darkness.
At least you don't have to pay school fees anymore.

**ENDING: ANOTHER VICTIM OF THE SYSTEM**
Please restart the game. 

-> END

=== death_hero ===
You gave your life so Grace could strike the final blow. You lie bleeding on the library steps as she defeats the monster.

You pass away, a hero of the university.

**ENDING: THE SACRIFICE**
Thank you for playing.

-> END

=== ending_survivors ===

📍 KENNETH DIKE LIBRARY (KDL) — SAFE ZONE

The heavy security doors are bolted shut. 

You, Grace, and Emeka sit in the quiet, dim light of Emeka's rechargeable lamp. 

The campus outside is a warzone. But in here, among the dusty library books, you are safe. For now.

Emeka looks at his watch. "Well, since we're stuck here until morning..." 
He pulls out a past-questions booklet. "...we might as well study for the departmental paper."

You share a look with Grace. The horror has only just begun.

**EPISODE 2 COMPLETE!**
**ENDING: THE TDB SURVIVORS**

Total XP Earned: {total_xp}
Surviving Health: {health}%

Will you survive Episode 3?

-> END
