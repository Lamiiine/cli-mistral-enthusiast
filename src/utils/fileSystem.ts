interface FileSystemNode {
  name: string;
  type: 'file' | 'directory';
  content?: string;
  children?: { [key: string]: FileSystemNode };
}

export class FileSystemSimulator {
  private root: FileSystemNode;
  private currentPath: string[];

  constructor() {
    this.root = {
      name: '/',
      type: 'directory',
      children: {}
    };
    this.currentPath = ['/'];
  }

  mkdir(name: string): string {
    const current = this.getCurrentDirectory();
    if (current.children[name]) {
      return `mkdir: ${name}: Directory already exists`;
    }
    current.children[name] = {
      name,
      type: 'directory',
      children: {}
    };
    return `Directory created: ${name}`;
  }

  ls(): string {
    const current = this.getCurrentDirectory();
    const contents = Object.keys(current.children || {});
    return contents.length ? contents.join('\n') : '';
  }

  cd(path: string): string {
    if (path === '..') {
      if (this.currentPath.length > 1) {
        this.currentPath.pop();
        return `Changed to ${this.currentPath.join('/')}`;
      }
      return 'Already at root';
    }

    const current = this.getCurrentDirectory();
    if (current.children?.[path] && current.children[path].type === 'directory') {
      this.currentPath.push(path);
      return `Changed to ${this.currentPath.join('/')}`;
    }
    return `cd: ${path}: No such directory`;
  }

  pwd(): string {
    return this.currentPath.join('/');
  }

  private getCurrentDirectory(): FileSystemNode {
    let current = this.root;
    for (const dir of this.currentPath.slice(1)) {
      current = current.children[dir];
    }
    return current;
  }
} 