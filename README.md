Collaborating Birds
===================

Background
----------

I want to visualize how co-creation patterns makes software development
better in many ways:

  * Lower technical debt: Higher internal and external quality
  * Kanban/Lean efficiency: Shorter lead times / higher throughput
  * Less context switching for developers
  * Higher learning rate for developers

I am not sure I can cover all in one simulation, let's see!


Rules
-----

Every bird has 'levels of experience' in 4 different colors:

   Red, Green, White, Blue

The colors represents different aspects of the software product
knowledge space. You could think of them as frontend, backend,
domain et cetera.

The levels range from 0 (no experience) to 10 (maximum experience).

Each user story contains 5 items with random colors. To bring
a user story from start to finish, all items need to be checked off:

   * bbwgr (not started story)
   * BBwgr (semi-worked on story)
   * BBWGR (finished story)

The items needs to be finished in order.

The time it takes for a bird to finish an item depends on it's
experience in the color of the item.

E.g a white level 10 bird finishes a white item really quickly,
while a white level 1 bird takes quite some time to finish the same
item. A white level 0 bird cannot finish a white item.

To simulate learning something new, there are four ponds in the
field, which birds can take a swim in for some time. This will
give them 1 experience point in the area. The amount of time
spent on this activity is a parameter to the simulation.

There is another way to learn:
If two birds decide to work together on a story, both will gain
experience points once the story is finished - in all colors
they together can work on. This is to simulate sharing knowledge
during pair-programming. The amount of points gained in this
kind of work is a parameter to the simulation.

The likelyhood of two birds deciding to work in pairs is a parameter
to the simulation. In the simulation, to avoid complexity, the
decision is actually made every time a bird is context switching,
whether to work solo (pick a story which no bird is working on)
or helping another bird out. The items which are worked on together
will be finished with the average speed of the two birds, e.g
if an item is red, and one bird has level 10 and another 5 in red,
the speed will be 7.5. Both birds will gain experience in red,
and whatever other color any one of the birds has experience in.

There is a backlog of stories on the left side of the bird field,
and when a bird is idle, it will pick a story which has
some item it has a level for. If there are several, it will take
the topmost story it can do some work on. If there is none, it
will stay idle.

When a bird has finished all items it can on a story, it will
leave the story on the ground. This story is considered "higher
priority" than stories on the backlog, for any bird which is idle.
The further to the right on the field the story lies, the higher
priority. The position chosen for working on a story is random.

Every time a bird starts working on a story, it is considered
a context switch. The context switch comes with a cost in time,
this is a parameter to the simulation.

When a story has all items ticked, it will be moved out of the bird
field, to the right, and is considered 'finished'. The time it took
from start to finish is the cycle time of the story.


State machine of a bird
-----------------------

   * CONTEXT_SWITCHING. Doing nothing.
   * FLYING_TO_STORY. Bird is flying to a story on the field or on backlog.
   * WORKING_ON_ITEM. Bird is working on a piece of a story - an item.
   * DEPLOYING. Bird is flying out with a finished story.
   * STUDYING. Bird is learning some skill.
   * FLYING_TO_POND. Bird is flying to pond.


State of a story
----------------

   * Items. An array of 5 work items of different color. Each item has a percent
   * Position.
   * Start- and end time.



Implementation notes
--------------------

Will be using "vanilla" react+typescript, I do not need anything but flexbox layout and svgrs.

Design. The simulation will be completely separated from the visuals/projection. In first iteration, input to the simulation (birds, backlog, parameters) will be fixed, and the output of the simulation will be the 4 statistics. Every tick it will be possible to investigate the state of birds, backlog, paintings, statistics in order to visualize it.

The simworld is a 100x100 field where the birds work. Some numbers are integer (level of skill, experience points), some are floats (position, velocity, work left on item). 

Concepts:
  * Skill (one of the 4 colors)
  * Bird (position, state, skill levels, experience points in each skill)
  * Item (a Skill and a percentage 'done')
  * Story (5 Items, start- and finish times, position)
  * Backlog (infinite list of random Stories)
  * Statistics
  * Input
  * Parameters
  * Field
  * FinishedStories (a list of finished stories and time-points when they finished)
