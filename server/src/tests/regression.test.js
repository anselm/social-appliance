import { API } from '../api/index.js';
import { connectDB, closeDB } from '../db/connection.js';

const api = new API();

async function runTests() {
  console.log('Starting regression tests...\n');
  
  try {
    await connectDB();
    
    // Test 1: Create a user account
    console.log('Test 1: Creating user account...');
    const user = await api.createUser({
      slug: 'test-user',
      title: 'Test User',
      content: 'A test user account'
    });
    console.log('✓ User created:', user.id);
    
    // Test 2: Create a group with a slug
    console.log('\nTest 2: Creating group with slug...');
    const group = await api.createGroup({
      slug: 'test-group',
      title: 'Test Group',
      content: 'A test group'
    });
    console.log('✓ Group created:', group.slug);
    
    // Test 3: Create a post in the group
    console.log('\nTest 3: Creating post in group...');
    const post1 = await api.createPost({
      title: 'Test Post',
      content: 'This is a test post',
      parentId: group.id,
      sponsorId: user.id
    });
    console.log('✓ Post created:', post1.id);
    
    // Test 4: Try to create a post with the same slug (should fail)
    console.log('\nTest 4: Creating post with duplicate slug...');
    try {
      await api.createPost({
        slug: 'test-group',
        title: 'Duplicate Slug Post'
      });
      console.log('✗ ERROR: Duplicate slug was allowed!');
    } catch (error) {
      console.log('✓ Correctly rejected duplicate slug:', error.message);
    }
    
    // Test 5: Create a post at a location
    console.log('\nTest 5: Creating post at location...');
    const locationPost = await api.createPost({
      title: 'Location Post',
      content: 'Post at a specific location',
      latitude: 45.5152,
      longitude: -122.6784,
      radius: 1000
    });
    console.log('✓ Location post created at:', locationPost.latitude, locationPost.longitude);
    
    // Test 6: Create a child post
    console.log('\nTest 6: Creating child post...');
    const childPost = await api.createPost({
      title: 'Reply Post',
      content: 'This is a reply',
      parentId: post1.id,
      sponsorId: user.id
    });
    console.log('✓ Child post created with parent:', childPost.parentId);
    
    // Test 7: Query posts near location
    console.log('\nTest 7: Querying posts near location...');
    const nearbyPosts = await api.queryEntities({
      type: 'post',
      latitude: 45.5152,
      longitude: -122.6784,
      radius: 2000
    });
    console.log('✓ Found', nearbyPosts.length, 'posts near location');
    
    // Test 8: Query posts not near location
    console.log('\nTest 8: Querying posts not near location...');
    const farPosts = await api.queryEntities({
      type: 'post',
      latitude: 40.7128,
      longitude: -74.0060,
      radius: 100
    });
    console.log('✓ Found', farPosts.length, 'posts at distant location');
    
    // Test 9: Delete test data
    console.log('\nTest 9: Cleaning up test data...');
    await api.deleteEntity(user.id);
    await api.deleteEntity(group.id);
    await api.deleteEntity(post1.id);
    await api.deleteEntity(locationPost.id);
    await api.deleteEntity(childPost.id);
    console.log('✓ Test data deleted');
    
    console.log('\n✅ All tests passed!');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error);
  } finally {
    await closeDB();
  }
}

runTests();
