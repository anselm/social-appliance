import readlineSync from 'readline-sync';
import chalk from 'chalk';
import { APIClient } from './api.js';

export class ConsoleClient {
  constructor() {
    this.api = new APIClient();
    this.currentPath = '/';
    this.currentUser = null;
  }

  async testConnection() {
    try {
      // Try a simple query to test the connection
      await this.api.queryEntities({ limit: 1 });
      return true;
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.error(chalk.red('\n⚠️  Cannot connect to server at http://localhost:3000'));
        console.error(chalk.yellow('Please make sure the server is running with: cd server && npm start\n'));
        return false;
      }
      // Other errors might be OK (e.g., permission errors)
      return true;
    }
  }

  async run() {
    console.log(chalk.green('Welcome to Social Appliance Console'));
    console.log(chalk.gray('Type "help" for available commands\n'));

    // Test connection on startup
    const connected = await this.testConnection();
    if (!connected) {
      process.exit(1);
    }

    while (true) {
      const prompt = chalk.blue(`${this.currentUser ? `[${this.currentUser.slug}]` : '[guest]'} ${this.currentPath} > `);
      const input = readlineSync.question(prompt);
      const [command, ...args] = input.trim().split(' ');

      try {
        await this.executeCommand(command, args);
      } catch (error) {
        if (error.code === 'ECONNREFUSED') {
          console.error(chalk.red('Error: Cannot connect to server. Is the server running on http://localhost:3000?'));
        } else if (error.message?.includes('fetch failed') || error.code === 'ECONNRESET') {
          console.error(chalk.red('Error: Connection to server lost. Please try again.'));
        } else {
          console.error(chalk.red('Error:'), error.message);
        }
      }
    }
  }

  async executeCommand(command, args) {
    switch (command) {
      case 'help':
        this.showHelp();
        break;
      
      case 'login':
        await this.login(args[0]);
        break;
      
      case 'register':
        await this.register(args[0]);
        break;
      
      case 'ls':
        await this.list();
        break;
      
      case 'cd':
        await this.changeDirectory(args[0]);
        break;
      
      case 'create':
        await this.create(args[0], args.slice(1).join(' '));
        break;
      
      case 'edit':
        await this.edit(args[0]);
        break;
      
      case 'view':
        await this.view(args[0]);
        break;
      
      case 'delete':
        await this.delete(args[0]);
        break;
      
      case 'rawdelete':
        await this.rawDelete(args[0]);
        break;
      
      case 'dump':
        await this.dump(args[0]);
        break;
      
      case 'query':
        await this.query(args[0]);
        break;
      
      case 'exit':
      case 'quit':
        console.log(chalk.yellow('Goodbye!'));
        process.exit(0);
        break;
      
      default:
        console.log(chalk.red(`Unknown command: ${command}`));
        console.log(chalk.gray('Type "help" for available commands'));
    }
  }

  showHelp() {
    console.log(chalk.yellow('\nAvailable commands:'));
    console.log('  help                    - Show this help message');
    console.log('  login <username>        - Login as a user');
    console.log('  register <username>     - Register a new user');
    console.log('  ls                      - List entities in current directory');
    console.log('  cd <path>               - Change to directory/entity');
    console.log('  create <type> <title>   - Create new entity (group/post)');
    console.log('  edit <slug>             - Edit an entity');
    console.log('  view <slug>             - View entity details');
    console.log('  delete <slug>           - Delete an entity by slug');
    console.log('  rawdelete <id>          - Delete an entity by raw ID');
    console.log('  dump [page]             - Dump all entities (paginated)');
    console.log('  query <prefix>          - Query entities by slug prefix');
    console.log('  exit/quit               - Exit the console\n');
  }

  async login(username) {
    if (!username) {
      console.log(chalk.red('Please provide a username'));
      return;
    }

    // Ensure username has leading slash for query
    const querySlug = username.startsWith('/') ? username : `/${username}`;
    const user = await this.api.getEntityBySlug(querySlug);
    if (!user || user.type !== 'party') {
      console.log(chalk.red('User not found'));
      return;
    }

    this.currentUser = user;
    console.log(chalk.green(`Logged in as ${user.title || user.slug}`));
  }

  async register(username) {
    if (!username) {
      console.log(chalk.red('Please provide a username'));
      return;
    }

    const slug = readlineSync.question('Slug (leave empty to use username): ') || username;
    const title = readlineSync.question('Full name: ');
    const content = readlineSync.question('Bio: ');

    const user = await this.api.createUser({
      slug,
      title,
      content
    });

    this.currentUser = user;
    console.log(chalk.green(`Registered and logged in as ${user.title || user.slug}`));
  }

  async list() {
    let entities;
    
    if (this.currentPath === '/') {
      // List root level entities (all types)
      entities = await this.api.queryEntities({ 
        limit: 50 
      });
    } else {
      // Get current entity and list its children
      const current = await this.api.getEntityBySlug(this.currentPath);
      if (!current) {
        console.log(chalk.red('Current path not found'));
        return;
      }
      
      entities = await this.api.queryEntities({
        parentId: current.id,
        limit: 50
      });
    }

    if (entities.length === 0) {
      console.log(chalk.gray('No entities found'));
      return;
    }

    console.log(chalk.yellow('\nEntities:'));
    entities.forEach(entity => {
      const icon = entity.type === 'group' ? '📁' : 
                   entity.type === 'party' ? '👤' : 
                   entity.type === 'place' ? '📍' : 
                   entity.type === 'thing' ? '📦' : 
                   entity.type === 'agent' ? '🤖' : '📄';
      const name = entity.slug || entity.id.slice(0, 8);
      console.log(`  ${icon} ${chalk.cyan(name)} [${entity.type}] - ${entity.title || '(untitled)'}`);
    });
    console.log();
  }

  async changeDirectory(path) {
    if (!path) {
      this.currentPath = '/';
      return;
    }

    if (path === '..') {
      const parts = this.currentPath.split('/').filter(p => p);
      parts.pop();
      this.currentPath = '/' + parts.join('/');
      return;
    }

    if (path.startsWith('/')) {
      // Absolute path
      const entity = await this.api.getEntityBySlug(path);
      if (!entity) {
        console.log(chalk.red('Path not found'));
        return;
      }
      this.currentPath = path;
    } else {
      // Relative path
      const newPath = this.currentPath === '/' ? `/${path}` : `${this.currentPath}/${path}`;
      const entity = await this.api.getEntityBySlug(newPath);
      if (!entity) {
        console.log(chalk.red('Path not found'));
        return;
      }
      this.currentPath = newPath;
    }
  }

  async create(type, title) {
    if (!type || !['group', 'post'].includes(type)) {
      console.log(chalk.red('Please specify type: group or post'));
      return;
    }

    if (!title) {
      console.log(chalk.red('Please provide a title'));
      return;
    }

    const slug = readlineSync.question('Slug (optional): ');
    const content = readlineSync.question('Content: ');

    let parentId = null;
    if (this.currentPath !== '/') {
      const parent = await this.api.getEntityBySlug(this.currentPath);
      if (parent) {
        parentId = parent.id;
      }
    }

    const data = {
      title,
      content,
      parentId,
      sponsorId: this.currentUser?.id,
      auth: this.currentUser?.id
    };

    if (slug) {
      data.slug = this.currentPath === '/' ? `/${slug}` : `${this.currentPath}/${slug}`;
    }

    let entity;
    if (type === 'group') {
      entity = await this.api.createGroup(data);
    } else {
      entity = await this.api.createPost(data);
    }

    console.log(chalk.green(`Created ${type}: ${entity.slug || entity.id}`));
  }

  async edit(slug) {
    if (!slug) {
      console.log(chalk.red('Please provide entity slug or ID'));
      return;
    }

    // Ensure slug has leading slash
    const querySlug = slug.startsWith('/') ? slug : `/${slug}`;
    const entity = await this.api.getEntityBySlug(querySlug);
    if (!entity) {
      console.log(chalk.red('Entity not found'));
      return;
    }

    console.log(chalk.yellow(`Editing: ${entity.title || entity.slug || entity.id}`));
    console.log(chalk.gray('Press enter to keep current value'));

    const title = readlineSync.question(`Title [${entity.title || ''}]: `) || entity.title;
    const content = readlineSync.question(`Content [${entity.content || ''}]: `) || entity.content;

    await this.api.updateEntity(entity.id, { title, content });
    console.log(chalk.green('Entity updated'));
  }

  async view(slug) {
    if (!slug) {
      console.log(chalk.red('Please provide entity slug or ID'));
      return;
    }

    // Ensure slug has leading slash
    const querySlug = slug.startsWith('/') ? slug : `/${slug}`;
    const entity = await this.api.getEntityBySlug(querySlug);
    if (!entity) {
      console.log(chalk.red('Entity not found'));
      return;
    }

    console.log(chalk.yellow('\nEntity Details:'));
    console.log(`  Type: ${entity.type}`);
    console.log(`  ID: ${entity.id}`);
    console.log(`  Slug: ${entity.slug || '(none)'}`);
    console.log(`  Title: ${entity.title || '(untitled)'}`);
    console.log(`  Content: ${entity.content || '(no content)'}`);
    console.log(`  Created: ${entity.createdAt}`);
    console.log(`  Updated: ${entity.updatedAt}`);
    console.log();
  }

  async delete(slug) {
    if (!slug) {
      console.log(chalk.red('Please provide entity slug'));
      return;
    }

    // Ensure slug has leading slash
    const querySlug = slug.startsWith('/') ? slug : `/${slug}`;
    const entity = await this.api.getEntityBySlug(querySlug);
    if (!entity) {
      console.log(chalk.red('Entity not found'));
      return;
    }

    const confirm = readlineSync.keyInYN(`Delete "${entity.title || entity.slug || entity.id}"?`);
    if (confirm) {
      await this.api.deleteEntity(entity.id);
      console.log(chalk.green('Entity deleted'));
    }
  }

  async rawDelete(id) {
    if (!id) {
      console.log(chalk.red('Please provide entity ID'));
      return;
    }

    const confirm = readlineSync.keyInYN(`Delete entity with ID "${id}"?`);
    if (confirm) {
      try {
        await this.api.deleteEntity(id);
        console.log(chalk.green('Entity deleted'));
      } catch (error) {
        console.log(chalk.red('Failed to delete entity'));
      }
    }
  }

  async dump(pageStr) {
    const page = parseInt(pageStr) || 1;
    const limit = 20;
    const offset = (page - 1) * limit;

    console.log(chalk.yellow(`\nDumping entities (page ${page}):`));
    
    const entities = await this.api.queryEntities({ limit, offset });
    
    if (entities.length === 0) {
      console.log(chalk.gray('No more entities'));
      return;
    }

    console.log(chalk.gray(`Showing ${entities.length} entities:\n`));
    
    entities.forEach(entity => {
      console.log(chalk.cyan(`${entity.id}`));
      console.log(`  Type: ${entity.type}`);
      if (entity.slug) console.log(`  Slug: ${entity.slug}`);
      if (entity.title) console.log(`  Title: ${entity.title}`);
      if (entity.sponsorId) console.log(`  Sponsor: ${entity.sponsorId}`);
      if (entity.parentId) console.log(`  Parent: ${entity.parentId}`);
      console.log(`  Created: ${entity.createdAt}`);
      console.log();
    });

    if (entities.length === limit) {
      console.log(chalk.gray(`Use "dump ${page + 1}" to see the next page`));
    }
  }

  async query(prefix) {
    if (!prefix) {
      console.log(chalk.red('Please provide a slug prefix to search for'));
      return;
    }

    console.log(chalk.yellow(`\nQuerying entities with slug prefix: ${prefix}`));
    
    const entities = await this.api.queryEntities({ 
      slugPrefix: prefix,
      limit: 100 
    });

    if (entities.length === 0) {
      console.log(chalk.gray('No entities found with that prefix'));
      return;
    }

    console.log(chalk.gray(`Found ${entities.length} entities:\n`));
    
    entities.forEach(entity => {
      const icon = entity.type === 'group' ? '📁' : entity.type === 'party' ? '👤' : '📄';
      console.log(`  ${icon} ${chalk.cyan(entity.slug)} - ${entity.title || '(untitled)'}`);
    });
    console.log();
  }
}
