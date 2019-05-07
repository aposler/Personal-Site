Assignment 4 - Real Web Apps: Designing for an Area of Life  
===
## Alex Osler | Data Visualization | Pathing Algirhtm Exploration
This was all done by Alex Osler

Project is here https://a4-aposler.herokuapp.com/

The project is allow the user to explore 4 different pathing algorithms,
A*, Breadth First, Depth First, and Greedy Best First. Each is simply
performed on a 2d plane, and the user able to create obstacles in the 
way of each algorithm by dragging on the HTML canvas. The user can see
all nodes explored by each algorithm, and can control the speed of them,
including pausing and stepping through the algorithm. The grid also has a
customizable size, between 2 and 50. Finally, the created grid can be saved
to a sqlite database, with a custom grid and username. If a user wants to load
the grid they can see all grids tied to a given username by entering the username,
and they can then load any of the grids.

This is not strictly data visualization, but it was cleared by Professor Harrison first.
Some of this code (mainly the A* implementation) was taken from a previous project
I created, linked [here](https://github.com/aposler/JavaScript_Project)

## Technical Achievements
- **Tech Achievement 1**: Implementing A*
- **Tech Achievement 2**: Implementing Depth First 
- **Tech Achievement 3**: Implementing Breadth First
- **Tech Achievement 4**: Implementing Greedy Best First
- **Tech Achievement 5**: Complex Interactions with the Canvas
- **Tech Achievement 6**: Allowing the user to step through the algorithms
- **Tech Achievement 7**: Saving and loading grids from a database

### Design/Evaluation Achievements
- **Design Achievement 1**: I went through multiple revsions for the user interface.
All comments were from close family, and the first 2 revisions were done on the previously mentioned project.

Revision 1)

A)Initially you could only mark obstructions by clicking, and dragging was suggested

B)changing the clarifying text to be clear about how to enter the grid size (used to be entered through a text box)

C)There used to be a message that would pop up if the path failed, and it would shift the page

D)Add a small animation to the solution to make it more appealing

Revision 2)

A)Make the path grow from start to end (it used to go from end to start in the final animation)

B):Dropped Suggestion: Allow the user to work in custom shapes

--Note on B, it was dropped because I felt that distracted a bit from the purpose of the project

C)Add a visual indicator when the path fails

--Note on C, that was when the red grid was added

Revision 3)

A)Change the colors from brown to something more appealing

B)Change the text box for dimensions to a slider

C)Add some way to save the grid

D)Allows the user to speed up the completed path (it was kinda slow at 50x50)

E)Add a "stop solving" button