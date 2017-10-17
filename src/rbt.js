// from https://github.com/pyrocat101/rbt.js
// modified by Guram Duka
//------------------------------------------------------------------------------
const RED = 0, BLACK = 1;
//------------------------------------------------------------------------------
////////////////////////////////////////////////////////////////////////////////
//------------------------------------------------------------------------------
class Tree {
  color;
  left;
  right;
  key;
  value;

  constructor(color, left, key, value, right) {
    this.color = color;
    this.left = left;
    this.right = right;
    this.key = key;
    this.value = value;
  }

  has(key) {
    if( key < this.key )
      return this.left.has(key);
    
      if( key > this.key )
      return this.right.has(key);
    
      return true;
  }

  add(key, value) {
    if( key < this.key )
      return this.balance(
        this.color,
        this.left.add(key, value),
        this.key,
        this.value,
        this.right);
    
    if( key > this.key )
      return this.balance(
        this.color,
        this.left,
        this.key,
        this.value,
        this.right.add(key, value));

      return new Tree(this.color, this.left, this.key, value, this.right);
  }

  balance(color, left, key, value, right) {
    if( color === BLACK ) {
      // case 1
      // ------
      //        B
      //       /|\
      //      R z d            R
      //     /|\              /|\
      //    / | \            / | \
      //   R  y  c    =>    B  y  B
      //  /|\              /|\   /|\
      // a x b            a x b c z d
      //
      // case 2
      // ------
      //       B
      //      /|\
      //     R z d              R
      //    /|\                /|\
      //   / | \              / | \
      //  a  x  R     =>     B  y  B
      //       /|\          /|\   /|\
      //      b y c        a x b c z d
      //
      // case 3
      // ------
      //     B
      //    /|\
      //   a x R                R
      //      /|\              /|\
      //     / | \            / | \
      //    R  z  d   =>     B  y  B
      //   /|\              /|\   /|\
      //  b y c            a x b c z d
      //
      // case 4
      // ------
      //    B
      //   /|\
      //  a x R                 R
      //     /|\               /|\
      //    / | \             / | \
      //   b  y  R    =>     B  y  B
      //        /|\         /|\   /|\
      //       c z d       a x b c z d
      //
      if( left instanceof Tree && left.color === RED ) {
        if( left.left instanceof Tree && left.left.color === RED ) {
          // case 1
          let level2 = left.left,
            l = new Tree(BLACK, level2.left, level2.key, level2.value, level2.right),
            r = new Tree(BLACK, left.right, key, value, right);
          return new Tree(RED, l, left.key, left.value, r);
        }
        if( left.right instanceof Tree && left.right.color === RED ) {
          // case 2
          let level2 = left.right,
            l = new Tree(BLACK, left.left, left.key, left.value, level2.left),
            r = new Tree(BLACK, level2.right, key, value, right);
          return new Tree(RED, l, level2.key, level2.value, r);
        }
      }
      else if( right instanceof Tree && right.color === RED ) {
        if( right.left instanceof Tree && right.left.color === RED ) {
          // case 3
          let level2 = right.left,
            l = new Tree(BLACK, left, key, value, level2.left),
            r = new Tree(BLACK, level2.right, right.key, right.value, right.right);
          return new Tree(RED, l, level2.key, level2.value, r);
        }
        if( right.right instanceof Tree && right.right.color === RED ) {
          // case 4
          let level2 = right.right,
            l = new Tree(BLACK, left, key, value, right.left)/*,
            r = new Tree(BLACK, level2.left, level2.key, level2.value, level2.right)*/;
          return new Tree(RED, l, right.key, right.value, level2.right);
        }
      }
    }
    return new Tree(color, left, key, value, right);
  }

  get(key) {
    if( key < this.key )
      return this.left.get(key);
    
    if( key > this.key )
      return this.right.get(key);

    return this.value;
  }

  count() {
    return this.left.count() + 1 + this.right.count();
  }

  iter(fn) { // fn: (k: string, v: T) => void
    this.left.iter(fn);
    fn(this.key, this.value);
    this.right.iter(fn);
  }

  map(fn) { // fn: (k: string, v: T) => T
    const left = this.left.map(fn),
      value = fn(this.key, this.value),
      right = this.right.map(fn);
    return new Tree(this.color, left, this.key, value, right);
  }

  reduce(fn, acc) { // fn: (k: string, v: T, acc: A) => A
    acc = this.left.reduce(fn, acc);
    acc = fn(this.key, this.value, acc);
    return this.right.reduce(fn, acc);
  }

  toObject() {
    const obj = {};
    this.iter((k, v) => obj[k] = v);
    return obj;
  }
}
//------------------------------------------------------------------------------
export default Tree;
//------------------------------------------------------------------------------
