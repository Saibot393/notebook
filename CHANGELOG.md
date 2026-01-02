## v2.0.2
- UI fix for popout tab

## v2.0.1
- Small UI fix for text notes

## v2.0.0
- v13 Compatibility
- Adjusted Tab design to match new ui

## v1.6.3
- Small bug fix for Text notes that could cause text notes to become desynched when multiple instances of the same note were opened by the same user

## v1.6.2
- Small bug fix for list notes

## v1.6.1
- Added japanese translation (thanks to [doumoku](https://github.com/doumoku))

## v1.6.0
- Added bew Scribble note:
  - Allows user to draw using their user color
  - A user can delete their own drawings using the eraser symbol at the top right
  - The owner can shift + click the eraser symbol to delete all drawings
- Added setting Note background to change the note background pattern
- Some small bug fixes and improvements

## v1.5.0
- Added new Enhanced Text note:
  - Allows for inline rolls and Actor/Item/Journal... links to be added to the text (can be added via drag and drop)
  - Allows for online images to be added via drag and drop
  - Allows for counting elements to be added to text using the following syntax `[[number/number]]` or `[[number]]`
    - Values can be altered using left and right click
  - Can be edited by clicking the edit icon thet appears at the top right when hovering the note
- The notebook tab can now be popped out into a seperate window using right click
- Several small quality of life improvements

## v1.4.3
- Improvement for list-note useability

## v1.4.2
- Small bug fix

## v1.4.1
- Small fix for compatibility with [PF2e Dorako UX](https://foundryvtt.com/packages/pf2e-dorako-ux)

## v1.4.0
- Added option to permission menu for GMs to show a note to players, causing the note to popup for these players

## v1.3.0
- Added new Macro note:
  - Allows macros to be added and reordered via drag and drop
  - Macros can be executed via right-click
  - Macros can be edited via left-click
  - Macro can be removed via shift + right-click
- Improved list notes:
  - Can now be indented using tab or shift + tab
  - Can now be re reordered using drag and drop
  - Sub entries can be synched to an entry using right-click
- Added several client settings:
  - Shift quick create: Note type created when creating note while holding shift
  - CTRL quick create: Note type created when creating note while holding CTRL
  - ALT quick create: Note type created when creating note while holding ALT
  - Small note height: Height some note types collapse to when the mouse leaves
  - Large note height: Height some note types expand to when the mouse enters

## v1.2.0
- Added folders
- Notes can now be copied using shift+right-click
- Improved Counter and Round Counter notes input logic
- Improved list Notes
  - Items can now be navigated using arow keys
  - Minimal render improvement

## v1.1.4
- Improved resize for some notes

## v1.1.3
- Fixed bug that caused the input for new timer notes to be ignored until they were started at least once

## v1.1.2
- Small improvements

## v1.1.1
- The cursor in text notes should now remain at the correct location when typing fast

## v1.1.0
- Added new Note, Round Counter:
  - Allows you to count rounds up or down with an optional limit
- Added notify sounds for certain note types (list, chat, timer, counter, progress clock, round counter)
  - Volume can be set by left clicking the new sound icon in the caption bar
  - Sound can be set by right clicking the
- Improved render stability
- Improved note sort algorithm
- The cursor in text notes should now remain at the correct location when multiple people are typing
- Some minor bug fixes

## v1.0.0
- First release
