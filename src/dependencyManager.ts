/**
 * @name DependencyManager
 * @description Dependency injection tool
 * @example
 *     const SomeComponent = () => {
 *       const dependencyManager = new DependencyManager();
 *       ...
 *       return <div />
 *     }
 */
export class DependencyManager {
  private _dependencies: Map<string, object>;
  constructor() {
    this._dependencies = new Map<string, object>();
  }

  /**
   * @name register
   * @description Method to register a dependency
   * @example
   *     const SomeComponent = () => {
   *       const dependencyManager = new DependencyManager();
   *       dependencyManager.register('someDependency', new SomeDependency());
   *       return <div />
   *     }
   */
  register(key: string, dependency: object): void {
    if (this._dependencies.has(key)) {
      throw new Error(`Dependency key already registered: ${key}`);
    }

    if (dependency === undefined) {
      throw new Error(`Dependency is undefined: ${key}`);
    }

    this._dependencies.set(key, dependency);
  }

  /**
   * @name resolve
   * @description Method to resolve a dependency
   * @param {string} key
   * @returns {object} The resolved dependency
   * @example
   *     const SomeComponent = () => {
   *       const dependencyManager = new DependencyManager();
   *       const someDependency = dependencyManager.resolve('someDependency');
   *       return <div />
   *     }
   */
  resolve(key: string): object | null {
    if (!this._dependencies.has(key)) {
      throw new Error(`Dependency not found: ${key}`);
    }

    if (this._dependencies.get(key) === undefined) {
      throw new Error(`Dependency is undefined: ${key}`);
    }

    return this._dependencies.get(key) || {};
  }
}
