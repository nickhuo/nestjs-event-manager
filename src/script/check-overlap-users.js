const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';

// Function to check if two events overlap
function eventsOverlap(event1, event2) {
  const start1 = new Date(event1.startTime);
  const end1 = new Date(event1.endTime);
  const start2 = new Date(event2.startTime);
  const end2 = new Date(event2.endTime);
  
  return start1 < end2 && start2 < end1;
}

// Function to find overlapping groups for a user's events
function findOverlappingGroups(events) {
  if (events.length <= 1) return [];

  // Sort events by start time
  const sortedEvents = [...events].sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  );

  const groups = [];
  const processed = new Set();

  for (let i = 0; i < sortedEvents.length; i++) {
    if (processed.has(sortedEvents[i].id)) continue;

    const currentGroup = [sortedEvents[i]];
    processed.add(sortedEvents[i].id);

    // Find all events that overlap with current group
    let foundOverlap = true;
    while (foundOverlap) {
      foundOverlap = false;
      for (let j = 0; j < sortedEvents.length; j++) {
        if (processed.has(sortedEvents[j].id)) continue;

        // Check if this event overlaps with any event in current group
        const overlapsWithGroup = currentGroup.some((groupEvent) =>
          eventsOverlap(groupEvent, sortedEvents[j])
        );

        if (overlapsWithGroup) {
          currentGroup.push(sortedEvents[j]);
          processed.add(sortedEvents[j].id);
          foundOverlap = true;
        }
      }
    }

    // Only create group if there are multiple events (overlapping)
    if (currentGroup.length > 1) {
      groups.push(currentGroup);
    }
  }

  return groups;
}

async function checkOverlapUsers() {
  try {
    console.log('Checking users with overlapping events...\n');
    
    // Get all users
    const response = await axios.get(`${API_BASE_URL}/users`);
    const users = response.data;
    
    console.log(`Found ${users.length} users\n`);
    
    const usersWithOverlaps = [];
    
    for (const user of users) {
      if (user.events && user.events.length > 1) {
        const overlapGroups = findOverlappingGroups(user.events);
        
        if (overlapGroups.length > 0) {
          const totalOverlappingEvents = overlapGroups.reduce(
            (count, group) => count + group.length, 0
          );
          
          usersWithOverlaps.push({
            name: user.name,
            id: user.id,
            totalEvents: user.events.length,
            overlappingGroups: overlapGroups.length,
            overlappingEvents: totalOverlappingEvents
          });
          
          console.log(`✓ ${user.name}`);
          console.log(`  - Total events: ${user.events.length}`);
          console.log(`  - Overlapping groups: ${overlapGroups.length}`);
          console.log(`  - Overlapping events: ${totalOverlappingEvents}`);
          
          // Show details of overlapping events
          overlapGroups.forEach((group, groupIndex) => {
            console.log(`  - Overlap group ${groupIndex + 1}:`);
            group.forEach((event, eventIndex) => {
              const startTime = new Date(event.startTime).toLocaleString();
              const endTime = new Date(event.endTime).toLocaleString();
              console.log(`    ${eventIndex + 1}. ${event.title} (${startTime} - ${endTime})`);
            });
          });
          console.log('');
        }
      }
    }
    
    console.log('='.repeat(50));
    console.log('Summary:');
    console.log(`Users with overlapping events: ${usersWithOverlaps.length}`);
    console.log('\nUser names:');
    usersWithOverlaps.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name}`);
    });
    
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.error('Connection failed: Please ensure the application is running (npm run start:dev)');
    } else {
      console.error('Error checking users with overlapping events:', error.message);
    }
  }
}

// Run the check
checkOverlapUsers();
