# Ruby Quick Reference

Targets Ruby 3.x; version-gated features are marked (e.g. **3.0+**). Note: this host has
Ruby 2.0, where `&.`, `Hash#dig`, `then`, endless methods, and pattern matching are
unavailable.

Conventions: `snake_case` for methods and variables, `CamelCase` for classes,
`SCREAMING_CASE` for constants, `?` suffix for predicates, `!` for the dangerous or
mutating variant.

---

## Most Common

| Code | Meaning |
|---|---|
| `irb` / `irb -r ./lib/x.rb` | REPL, optionally preloading a file |
| `ruby -e 'puts RUBY_VERSION'` | One-liner |
| `ruby -Ilib -rmy_gem -e '...'` | Run with a load path and require |
| `puts x` / `p x` / `pp x` | Print / inspect / pretty-print |
| `x.class`, `x.methods.sort`, `x.inspect` | Introspection |
| `"interpolated #{value}"` | String interpolation (double quotes only) |
| `arr.each { \|x\| puts x }` | Iterate |
| `arr.map { \|x\| x * 2 }` | Transform |
| `arr.select { \|x\| x > 3 }` / `.reject` | Filter in / out |
| `hash.each { \|k, v\| ... }` | Iterate a hash |
| `hash.fetch(:k, default)` | Safe lookup |
| `arr.sum`, `.min`, `.max`, `.sort_by`, `.count` | Aggregates |
| `x.nil?` / `x&.method` | Nil check / safe navigation (**2.3+**) |
| `x \|\|= default` | Assign only if nil or false |
| `begin/rescue/ensure/end` | Error handling |
| `require 'json'; JSON.pretty_generate(o)` | JSON |
| `File.read(path)` / `File.write(path, s)` | Whole-file I/O |
| `bundle install` / `bundle exec rspec` | Dependencies / run in context |
| `gem install pkg` | Install a gem |
| `binding.irb` | Drop into a REPL at this line |

---

## Types & Literals

```ruby
n     = 42                    # Integer, arbitrary precision
f     = 3.14                  # Float
r     = 1/3r                  # Rational
c     = 2+3i                  # Complex
big   = 1_000_000             # underscores for readability
s     = "text"                # String
sym   = :name                 # Symbol — immutable, interned
arr   = [1, 2, 3]             # Array
h     = { a: 1, "b" => 2 }    # Hash
rng   = (1..10)               # inclusive Range
rng2  = (1...10)              # exclusive
re    = /\d+/                 # Regexp
nil; true; false              # NilClass, TrueClass, FalseClass
->(x) { x * 2 }               # Lambda
```

| Operation | Result |
|---|---|
| `7 / 2` → `3` | Integer division |
| `7.0 / 2` → `3.5` | Float division |
| `7.fdiv(2)` → `3.5` | Explicit float division |
| `7 % 3`, `2 ** 10` | Modulo, power |
| `7.divmod(2)` → `[3, 1]` | Quotient and remainder |
| `"42".to_i`, `"1.5".to_f`, `42.to_s` | Conversion |
| `Integer("42")` | Strict conversion — raises on bad input |
| `"ff".to_i(16)` | Parse with a base |
| `x == y` / `x.equal?(y)` / `x.eql?(y)` | Value / identity / value-and-type |
| `x <=> y` | Spaceship: `-1`, `0`, `1`, or `nil` |
| `1.between?(0, 5)`, `(1..5).cover?(3)` | Range tests |
| `x.frozen?` / `x.freeze` | Immutability |
| `defined?(x)` | Is it defined? |

Only `nil` and `false` are falsy — `0` and `""` are truthy. That trips up people coming
from other languages.

---

## Strings & Symbols

| Code | Result |
|---|---|
| `"a#{x}b"` | Interpolation (single quotes don't interpolate) |
| `'literal \n'` | No escapes except `\'` and `\\` |
| `"%.2f" % 3.14159` / `format('%05d', 42)` | printf-style formatting |
| `s.length`, `s.bytesize` | Characters / bytes |
| `s.upcase`, `.downcase`, `.capitalize`, `.swapcase` | Case |
| `s.strip`, `.lstrip`, `.rstrip`, `.chomp` | Trim (`chomp` = trailing newline) |
| `s.sub('a', 'b')` / `s.gsub(/a/, 'b')` | Replace first / all |
| `s.gsub(/(\w)/) { $1.upcase }` | Replace with a block |
| `s.split(',')` / `arr.join('-')` | Split / join |
| `s.include?('x')`, `.start_with?`, `.end_with?` | Membership |
| `s.index('x')` / `s =~ /re/` | Position of a match |
| `s[0]`, `s[0..2]`, `s[-1]`, `s[1, 3]` | Indexing and slicing |
| `s.chars`, `.lines`, `.bytes`, `.each_char` | Decompose |
| `s.tr('abc', 'xyz')` | Character-wise translate |
| `s.delete('aeiou')`, `s.squeeze` | Remove / collapse runs |
| `s * 3`, `s.reverse`, `s.center(20, '.')` | Repeat, reverse, pad |
| `s.ljust(10)`, `s.rjust(10, '0')` | Pad |
| `s.to_sym` / `:sym.to_s` | String ↔ Symbol |
| `s.match?(/re/)` | Boolean match, no `$~` (**2.4+**) |
| `s.scan(/\d+/)` | All matches as an array |
| `s.freeze` / `# frozen_string_literal: true` | Immutable strings |
| `<<~HEREDOC ... HEREDOC` | Squiggly heredoc, strips indentation (**2.3+**) |
| `%w[a b c]` / `%i[a b c]` | Word array / symbol array |
| `%q(single)` / `%Q(double #{x})` | Alternate quoting |

Regex captures land in `$1`, `$2`, `$~`, and `Regexp.last_match`. Named groups:
`/(?<year>\d{4})/` then `m[:year]`.

---

## Collections & Enumerable

| Code | Action |
|---|---|
| `arr.each`, `.each_with_index`, `.each_with_object({})` | Iterate |
| `arr.map` / `.map!` / `.flat_map` | Transform (`!` mutates) |
| `arr.select` / `.filter` / `.reject` | Keep / drop |
| `arr.find` / `.detect` | First match |
| `arr.reduce(0) { \|acc, x\| acc + x }` / `.inject(:+)` | Fold |
| `arr.sum`, `.min`, `.max`, `.minmax` | Aggregates |
| `arr.min_by(&:length)` / `.max_by` | Extremes by a key |
| `arr.sort`, `.sort_by(&:name)`, `.sort { \|a, b\| b <=> a }` | Sort |
| `arr.group_by(&:type)` | → Hash of arrays |
| `arr.partition { \|x\| x > 3 }` | → `[matching, rest]` |
| `arr.tally` | → counts Hash (**2.7+**) |
| `arr.uniq`, `.uniq { \|x\| x.id }` | Dedupe |
| `arr.compact` | Drop `nil`s |
| `arr.flatten`, `.flatten(1)` | Nested → flat |
| `arr.count { \|x\| x > 3 }` | Conditional count |
| `arr.any?`, `.all?`, `.none?`, `.one?` | Predicates |
| `arr.include?(x)` | Membership |
| `arr.first(3)`, `.last(2)`, `.take(3)`, `.drop(2)` | Slices |
| `arr.take_while`, `.drop_while` | Conditional slices |
| `arr.each_slice(3)`, `.each_cons(2)` | Chunks / sliding windows |
| `arr.zip(other)` | Pair up |
| `arr.push(x)` / `<<` / `.pop` / `.shift` / `.unshift` | Stack and queue ops |
| `arr.sample`, `.shuffle`, `.rotate(2)` | Randomize / rotate |
| `arr \| other`, `arr & other`, `arr - other` | Union, intersection, difference |
| `arr.sum(&:price)` | Sum a projection |
| `arr.lazy.map { }.first(5)` | Lazy evaluation on infinite/large sequences |
| `arr.each_entry.with_index(1)` | Start indexing at 1 |

```ruby
h = { a: 1, b: 2 }
h[:a]                     # 1 — nil if missing
h.fetch(:c)               # raises KeyError
h.fetch(:c, 0)            # 0
h.dig(:a, :b, :c)         # nested, nil-safe (2.3+)
h.key?(:a); h.value?(1)
h.keys; h.values; h.to_a
h.map { |k, v| [k, v * 2] }.to_h
h.transform_values { |v| v * 2 }        # 2.4+
h.transform_keys(&:to_s)                # 2.5+
h.select { |k, v| v > 1 }; h.reject { }
h.merge(other) { |key, a, b| a + b }    # block resolves conflicts
h.each_with_object({}) { |(k, v), acc| acc[v] = k }
h.sort_by { |k, v| -v }.to_h
h.sum { |k, v| v }
Hash.new(0)               # default value — great for counting
Hash.new { |hash, k| hash[k] = [] }     # default block

require 'set'
s = Set.new([1, 2]); s << 3; s.include?(2); s | other; s & other
Struct.new(:x, :y, keyword_init: true)
```

`map`/`select` without a block return an Enumerator — chain `.with_index` or `.lazy` onto it.

---

## Blocks, Procs & Lambdas

```ruby
arr.each { |x| puts x }                    # single line
arr.each do |x|                            # multi-line
  puts x
end

arr.map(&:upcase)                          # symbol-to-proc shorthand
arr.each_with_index { |x, i| }             # multiple block params
h.each { |k, v| }                          # destructured pair
arr.each { |(a, b), i| }                   # nested destructuring
arr.map { _1 * 2 }                         # numbered params (2.7+)
arr.map { it * 2 }                         # implicit param (3.4+)

def with_retry(times: 3)
  yield                                    # call the block
rescue
  retry if (times -= 1) > 0
  raise
end
with_retry { risky_call }

def maybe
  return 'no block' unless block_given?
  yield 42
end

def explicit(&blk)                         # capture the block as a Proc
  blk.call(1)
end

sq  = ->(x) { x * x }                      # lambda: strict arity, `return` is local
sq.call(3); sq.(3); sq[3]
pr  = proc { |x| x.to_i }                  # proc: lax arity, `return` exits the method
m   = 5.method(:+)                         # method object
add = method(:puts).to_proc

# Chaining and object piping
5.then { |n| n * 2 }                       # 2.6+
obj.tap { |o| puts o.inspect }             # side effect, returns obj
```

---

## Control Flow

```ruby
if x > 10 then 'big' elsif x > 5 then 'mid' else 'small' end
puts 'yes' if cond                         # trailing modifier
puts 'no'  unless cond
value = cond ? 'a' : 'b'

case x
when 1, 2      then 'low'
when 3..10     then 'mid'
when Integer   then 'other int'
when /^\d+$/   then 'numeric string'
when ->(v) { v.odd? } then 'odd'
else 'unknown'
end

case config                                # pattern matching (3.0+)
in { name: String => name, port: Integer => port }
  connect(name, port)
in [first, *rest]
  handle(first, rest)
in { env: 'prod' | 'staging' => env }
  deploy(env)
else
  raise ArgumentError
end

arr.each { |x| next if skip?(x); break if done?(x) }

5.times { |i| puts i }
1.upto(5) { |i| }
10.downto(1) { |i| }
1.step(10, 2) { |i| }
(1..5).each { |i| }
loop { break if done }                     # rescues StopIteration
while cond; end
until cond; end
begin; end while cond                      # runs at least once
```

---

## Classes & Modules

```ruby
class Shape
  KINDS = %i[circle square].freeze          # constant
  attr_reader   :name                       # getter
  attr_writer   :color                      # setter
  attr_accessor :size                       # both

  def self.build(**opts)                    # class method
    new(**opts)
  end

  def initialize(name:, size: 1)
    @name = name                            # instance variable
    @size = size
    @@count = (@@count || 0) + 1            # class variable (avoid; prefer @count on self)
  end

  def to_s   = "#{@name} (#{@size})"        # endless method (3.0+)
  def area   = 0
  def big?   = @size > 10
  def grow!  = @size *= 2

  def <=>(other) = size <=> other.size      # enables sort and Comparable
  include Comparable

  def ==(other) = other.is_a?(Shape) && name == other.name

  private

  def internal_helper; end

  protected

  def compare_internals(other) = other.send(:internal_helper)
end

class Circle < Shape                        # inheritance
  def initialize(radius:, **rest)
    super(**rest)
    @radius = radius
  end
  def area = Math::PI * @radius**2
end

module Greetable                            # mixin
  def greet = "Hello, #{name}"
end

module Utils                                # namespace + module functions
  def self.slug(s) = s.downcase.tr(' ', '-')
end

class Shape
  include Greetable                         # instance methods
  extend  Utils                             # class methods
  prepend Logging                            # inserted ahead of the class
end

Shape.ancestors                             # method lookup order
obj.respond_to?(:area)
obj.is_a?(Shape); obj.instance_of?(Shape)
obj.send(:private_method)                   # bypass visibility
obj.public_send(:area)                      # respects visibility
obj.instance_variable_get(:@name)
obj.freeze; obj.dup; obj.clone
Shape.instance_methods(false)
define_method(:dynamic) { |x| x }           # metaprogramming
```

`Comparable` needs `<=>`; `Enumerable` needs `each`. Both then give you a large API free.

---

## Errors

```ruby
begin
  risky
rescue ArgumentError, TypeError => e
  warn "#{e.class}: #{e.message}"
rescue StandardError => e
  puts e.backtrace.first(5)
  raise MyError, 'wrapped'                  # cause is tracked automatically
else
  puts 'no exception'
ensure
  cleanup                                   # always runs
end

def method_with_rescue                      # implicit begin block
  risky
rescue => e                                 # bare rescue catches StandardError
  nil
end

raise ArgumentError, 'bad input'
raise MyError.new('detail')
raise                                       # re-raise the current exception

class MyError < StandardError
  def initialize(msg = 'default message') = super
end

value = Integer(input) rescue 0              # inline rescue (use sparingly)

attempts = 0
begin
  fetch
rescue Net::ReadTimeout
  retry if (attempts += 1) < 3
  raise
end
```

Rescue `StandardError`, not `Exception` — the latter catches `SignalException` and
`SystemExit`, so `Ctrl+C` stops working. A bare `rescue` already means `StandardError`.

Hierarchy: `Exception` > `StandardError` > `ArgumentError`, `TypeError`, `NameError` >
`NoMethodError`, `KeyError`, `IndexError`, `IOError`, `RuntimeError`, `ZeroDivisionError`,
`FrozenError`.

---

## Files, I/O & Standard Library

```ruby
File.read(path)                             # whole file as a String
File.write(path, content)                   # create or truncate
File.readlines(path, chomp: true)           # array of lines
File.foreach(path) { |line| }               # streaming, memory-friendly
File.open(path, 'w') { |f| f.puts 'x' }     # auto-closes
File.exist?(p); File.directory?(p); File.size(p); File.mtime(p)
File.basename(p, '.rb'); File.dirname(p); File.extname(p)
File.expand_path('~/x'); File.join('a', 'b')
FileUtils.mkdir_p('a/b'); FileUtils.cp_r(s, d); FileUtils.rm_rf(d)
Dir.glob('**/*.rb'); Dir.children('.'); Dir.pwd; Dir.mktmpdir
IO.popen('ls') { |io| io.read }
$stdin.gets; $stdin.each_line { }; STDIN.read
ARGF.each_line { |l| }                      # files from ARGV, else stdin
```

| Require | Use |
|---|---|
| `json` | `JSON.parse(s, symbolize_names: true)`, `JSON.pretty_generate(o)` |
| `yaml` | `YAML.safe_load(s)`, `o.to_yaml` |
| `csv` | `CSV.read(p, headers: true)`, `CSV.foreach(p, headers: true)` |
| `set` | `Set` |
| `time` / `date` | `Time.now`, `Time.parse`, `Date.today`, `Time#strftime` |
| `securerandom` | `SecureRandom.hex(16)`, `.uuid` |
| `digest` | `Digest::SHA256.hexdigest(s)` |
| `base64` | `Base64.strict_encode64(s)` |
| `net/http` / `uri` | `Net::HTTP.get(URI(url))` |
| `open3` | `Open3.capture3('cmd')` → stdout, stderr, status |
| `optparse` | CLI option parsing |
| `logger` | `Logger.new($stdout, level: :info)` |
| `benchmark` | `Benchmark.bm`, `Benchmark.realtime { }` |
| `tempfile` | `Tempfile.create` |
| `ostruct` | `OpenStruct.new(a: 1)` |
| `forwardable` | `def_delegators :@list, :each, :size` |
| `singleton` | `include Singleton` |
| `objspace` | Memory introspection |

Shelling out: `` `cmd` `` captures stdout, `system('cmd')` returns a boolean,
`Open3.capture3` gives you stdout, stderr, and status separately. Prefer the array form
(`system('ls', dir)`) — it skips the shell and avoids injection.

---

## Gems, Bundler & Tooling

| Command | Action |
|---|---|
| `gem install pkg` / `gem list` / `gem which x` | Install / list / locate |
| `bundle init` | Create a Gemfile |
| `bundle install` / `bundle update pkg` | Install / upgrade |
| `bundle exec rspec` | Run inside the bundle's dependency set |
| `bundle add pkg` | Add and install in one step |
| `bundle outdated` | What's behind |
| `bundle open pkg` | Open a gem's source in `$EDITOR` |
| `rbenv install 3.3.0` / `rbenv local 3.3.0` | Version management (or `asdf`, `rvm`) |
| `rake -T` | List Rake tasks |
| `rspec -f doc` / `rspec spec/x_spec.rb:42` | Tests: doc format / one example |
| `ruby -Itest test/x_test.rb` | Minitest |
| `rubocop -a` / `-A` | Autocorrect (safe / all) |
| `standardrb --fix` | Opinionated zero-config linting |
| `srb tc` / `steep check` | Static typing (Sorbet / RBS+Steep) |
| `ruby -c file.rb` | Syntax check only |
| `ruby -w file.rb` | Enable warnings |
| `ruby -rdebug -e '...'` / `debugger` | Debugger (**3.1+**) |
| `binding.irb` | REPL at a breakpoint |
| `irb --simple-prompt -r ./lib/x` | REPL with your code loaded |
| `ruby -rbenchmark -e '...'` | Quick benchmark |
| `ruby -ne 'puts $_.upcase'` file | Line-by-line one-liner (like awk) |
| `ruby -pe '$_.sub!(/a/, "b")'` file | Print-loop one-liner (like sed) |

Gemfile basics:

```ruby
source 'https://rubygems.org'
ruby '3.3.0'

gem 'sinatra', '~> 4.0'          # >= 4.0, < 5.0
gem 'rake', require: false

group :development, :test do
  gem 'rspec'
  gem 'rubocop', require: false
end
```

---

## Cheat Sheet Card

```
ENUMERABLE              STRINGS                 HASH                    CLASSES
each map select         "a#{x}"  '%.2f' % n     h.fetch(:k, dflt)       attr_accessor :x
reject find reduce      s.sub/.gsub(/re/,'x')   h.dig(:a, :b)           def self.build
sum min_by max_by       s.split(',') .join      h.transform_values      def to_s = "..."
sort_by group_by        s.strip .chomp          h.each { |k,v| }        include Comparable
partition tally uniq    s.match?(/re/) .scan    Hash.new(0)             super(**opts)
any? all? none?         %w[a b]  %i[a b]        h.merge(o) { }          obj.respond_to?(:x)
first take drop         <<~HEREDOC              Set.new([1,2])          Struct.new(:x, :y)
each_slice each_cons    s.to_sym .to_i(16)      h.sort_by { }.to_h      define_method(:x)

FLOW                    BLOCKS                  ERRORS                  TOOLS
if/elsif  unless        { |x| }  do...end       begin/rescue/ensure     bundle exec rspec
x if cond               arr.map(&:upcase)       rescue => e             rubocop -a
case/when/then          yield  block_given?     raise X, 'msg'          ruby -c file.rb
case/in (3.0+)          ->(x) { }  .call        retry                   binding.irb
x ||= dflt  x&.m        5.then { }  .tap { }    e.message .backtrace    rbenv local 3.3.0
5.times { |i| }         { _1 * 2 }  { it * 2 }  StandardError not Excep gem install pkg
```
