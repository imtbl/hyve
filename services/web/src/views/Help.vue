<template>
  <div class="wrapper">

    <vue-headful :title="title | formatToConfiguredLetterCase" />

    <section class="section">

      <div class="container">

        <div class="columns is-centered">

          <div class="column is-10-tablet is-8-desktop">

            <div class="frame">

              <div class="content">

                <h1 class="has-text-primary">Help</h1>

                <h2 class="has-text-primary">Files</h2>

                <p>
                  The <router-link to="/files">files</router-link> view allows
                  you to search for files by providing tags and/or constraints
                  and to sort the results in various fashions.
                </p>

                <h3 class="has-text-primary">Searching</h3>

                <p>
                  Files can be searched by either tags or constraints (or a
                  combination of both). When typing in the search input,
                  autocompletion suggestions for both will be shown in a
                  dropdown. They can be distinguished by color (tag colors can
                  be set in the
                  <router-link to="/settings">settings</router-link> view) and
                  the
                  <span class="icon"><font-awesome-icon icon="tools" /></span>
                  icon constraint suggestions are prefixed with.
                </p>

                <p>
                  These suggestions can be selected via keyboard (by navigating
                  the dropdown with the <kbd>↑</kbd><kbd>↓</kbd> keys and
                  hitting <kbd>Enter ⏎</kbd>) or click and will either add
                  the selected suggestion to the search as a filter or
                  partially complete the input (in case of a constraint).
                </p>

                <p>
                  Once a tag or constraint is added to the search, it will
                  be displayed in the list of filters below the search form.
                  While the search input is highlighted, this list can be
                  accessed via keyboard by hitting <kbd>Tab ⇥</kbd> and then
                  navigated via <kbd>Tab ⇥</kbd>, <kbd>Shift ⇧ + Tab ⇥</kbd>
                  and the <kbd>→</kbd><kbd>←</kbd> keys. Hitting
                  <kbd>Enter ⏎</kbd> will remove the highlighted filter. By
                  hitting <kbd>Esc</kbd> or simply starting to type another tag
                  or constraint, the focus will return to the search input.
                  Alternatively, a filter can also be removed via clicking on
                  it.
                </p>

                <h4 class="has-text-primary">Tags</h4>

                <p>
                  Tags are rather straightforward and can either limit the
                  search results by <em>including</em> a tag or
                  <em>excluding</em> a tag by prefixing it with a
                  <code>-</code>. To prevent confusion with tags that start
                  with a <code>-</code>, prefix such tags with <code>\</code>,
                  e.g., <code>\-house</code>.
                </p>

                <p>
                  You can also use <code>*</code> at the beginning or end of a
                  tag as a wildcard. Like when excluding tags with
                  <code>-</code>, prefix <code>*</code> with a <code>\</code>
                  if you want to use it as an actual character in your search.
                  This is only necessary for <code>*</code> at the beginning
                  or end of a tag, e.g., <code>\*hai*r\*</code>. Wildcarded
                  tags can also be excluded like normal tags (by prefixing with
                  <code>-</code>).
                </p>

                <p>
                  There is no limit on how many tags can be provided and each
                  included or excluded tag will further limit the search
                  results.
                </p>

                <h4 class="has-text-primary">Constraints</h4>

                <p>
                  Constraints are used to filter files by their (meta) fields
                  and can be used alone or in combination with tags. The
                  syntax is the following for a single constraint:
                </p>

                <p>
                  <code>&lt;field&gt;&lt;comparator&gt;&lt;value&gt;</code>
                </p>

                <p>
                  Where <code>field</code> has to be one of the following:
                </p>

                <ul>
                  <li><code>id</code>: the file ID</li>
                  <li><code>hash</code>: the SHA-256 hash of the file</li>
                  <li><code>size</code>: the file size in number of bytes</li>
                  <li><code>width</code>: the width of the file</li>
                  <li><code>height</code>: the height of the file</li>
                  <li><code>mime</code>: the MIME type of the file</li>
                  <li>
                    <code>tags</code>:
                    the number of tags assigned to the file
                  </li>
                </ul>

                <p><code>comparator</code> can be one of:</p>

                <ul>
                  <li>
                    <code>=</code>:
                    compares if the content of the field equals the given value
                    (supported by all fields)
                  </li>
                  <li>
                    <code>!=</code>:
                    compares if the content of the field does not equal the
                    given value (supported by all fields)
                  </li>
                  <li>
                    <code>~=</code>:
                    compares if the content of the field approximately equals
                    the given value (not supported by <code>hash</code> and
                    <code>mime</code>)
                  </li>
                  <li>
                    <code>&gt;</code>:
                    compares if the content of the field is greater than the
                    given value (not supported by <code>hash</code> and
                    <code>mime</code>)
                  </li>
                  <li>
                    <code>&lt;</code>:
                    compares if the content of the field is smaller than the
                    given value (not supported by <code>hash</code> and
                    <code>mime</code>)
                  </li>
                  <li>
                    <code>&gt;&lt;</code>:
                    compares if the content of the field is between the two
                    given values (the values are split by <code>,</code> and
                    their order does not matter) (not supported by
                    <code>hash</code> and <code>mime</code>)</li>
                </ul>

                <p>And <code>value</code> can be:</p>

                <ul>
                  <li>
                    <em>a positive integer or <code>0</code></em>:
                    can be used for comparing with <code>id</code>,
                    <code>width</code>, <code>height</code> and
                    <code>tags</code>
                    when using the <code>=</code>, <code>!=</code>,
                    <code>~=</code>, <code>&gt;</code> or <code>&lt;</code>
                    comparator
                  </li>
                  <li>
                    <em>two positive integers or <code>0</code> split with
                    <code>,</code></em>:
                    can be used for comparing with <code>id</code>,
                    <code>width</code>, <code>height</code> and
                    <code>tags</code> when using the <code>&gt;&lt;</code>
                    comparator
                  </li>
                  <li>
                    <em>a file size</em>:
                    can be used for comparing with <code>size</code> when using
                    the <code>=</code>, <code>!=</code>, <code>~=</code>,
                    <code>&gt;</code> or <code>&lt;</code> comparator and has
                    to be either a positive integer (for bytes) or a positive
                    integer or float (with <code>.</code> as decimal point)
                    plus a suffix of either <code>k</code>, <code>m</code> or
                    <code>g</code> (for <em>kibibytes</em>, <em>megabytes</em>
                    and <em>gigabytes</em> respectively)</li>
                  <li>
                    <em>two file sizes split with <code>,</code></em>:
                    can be used for comparing with <code>size</code> when using
                    the <code>&gt;&lt;</code> comparator (the same rules as the
                    ones for the single file size apply)
                  </li>
                  <li>
                    <em>a SHA-256 digest:</em>
                    can be used for comparing with <code>hash</code>
                  </li>
                  <li>
                    <em>a MIME type in the common
                    <code>&lt;type&gt;/&lt;subtype&gt;</code> syntax</em>:
                    can be used for comparing with <code>mime</code></li>
                </ul>

                <p>
                  There is no limit on how many constraints can be provided and
                  each one will further limit the search results.
                </p>

                <p>
                  If multiple constraints for the same field are provided, only
                  one of those needs to match for a file to be kept in the
                  search results. The exception is when there are multiple
                  <code>!=</code> constraints for the field, in which case each
                  of those individually removes a file from the search results
                  when there is no match.
                </p>

                <h3 class="has-text-primary">Sorting</h3>

                <p>
                  The results from a file search can be sorted in various ways
                  by opening the sorting quickview via clicking on the sorting
                  input. The default sorting can also be set in the
                  <router-link to="/settings">settings</router-link> view.
                </p>

                <p>File search results can be sorted in the following ways:</p>

                <ul>
                  <li>by <em>ID</em></li>
                  <li>by <em>file size</em></li>
                  <li>by <em>width</em></li>
                  <li>by <em>height</em></li>
                  <li>by <em>MIME type</em></li>
                  <li>by <em>amount of tags</em></li>
                  <li>by <em>namespaces</em></li>
                  <li><em>randomly</em></li>
                </ul>

                <p>
                  For all sorting methods other than <em>random</em>, the
                  sorting direction can also be specified as either
                  <em>default</em>, <em>ascending</em> or <em>descending</em>.
                </p>

                <p>
                  Selecting <em>default</em> will use the following directions
                  depending on the selection method:
                </p>

                <ul>
                  <li><strong>by <em>ID</em>:</strong> descending</li>
                  <li><strong>by <em>file size</em>:</strong> descending</li>
                  <li><strong>by <em>width</em>:</strong> descending</li>
                  <li><strong>by <em>height</em>:</strong> descending</li>
                  <li><strong>by <em>MIME type</em>:</strong> ascending</li>
                  <li>
                  <strong>by <em>amount of tags</em>:</strong>
                   descending
                  </li>
                  <li>
                    <strong>by <em>namespaces</em>:</strong>
                    ascending by provided namespaces first and descending by
                    <em>ID</em> second (if a file does not have a tag with that
                    namespace)
                  </li>
                </ul>

                <p>
                  Finally, when sorting by <em>namespaces</em>, the results get
                  sorted by one or more namespaces that need to be defined as
                  well. Results get sorted by each namespace in order (so if
                  multiple are defined, the sorting will be done for the first
                  namespace, then the second, then the third, etc.).
                </p>

                <p>
                  There is no limit on how many namespaces can be defined for
                  sorting and their order can be rearranged via drag and drop.
                </p>

                <h2 class="has-text-primary">Tags</h2>

                <p>
                  The <router-link to="/tags">tags</router-link> view allows
                  you to search for tags by providing a word they are compared
                  to and to sort the results in various fashions.
                </p>

                <h3 class="has-text-primary">Searching</h3>

                The tag search is simple and only allows for providing a word
                tags are compared to. If a tag does not contain the given word,
                it will be removed from the results.

                <h3 class="has-text-primary">Sorting</h3>

                <p>
                  The results from a tag search can be sorted in various ways
                  by opening the sorting quickview via clicking on the sorting
                  input. The default sorting can also be set in the
                  <router-link to="/settings">settings</router-link> view.
                </p>

                <p>Tag search results can be sorted in the following ways:</p>

                <ul>
                  <li>by <em>ID</em></li>
                  <li>by <em>name</em></li>
                  <li>by <em>amount of files </em></li>
                  <li>by <em>given word</em> (starting with)</li>
                  <li><em>randomly</em></li>
                </ul>

                <p>
                  For all sorting methods other than <em>random</em>, the
                  sorting direction can also be specified as either
                  <em>default</em>, <em>ascending</em> or <em>descending</em>.
                </p>

                <p>
                  Selecting <em>default</em> will use the following directions
                  depending on the selection method:
                </p>

                <ul>
                  <li><strong>by <em>ID</em>:</strong> descending</li>
                  <li><strong>by <em>name</em>:</strong> ascending</li>
                  <li>
                    <strong>by <em>amount of files</em>:</strong>
                    descending
                  </li>
                  <li>
                    <strong>by <em>given word</em>:</strong>
                    ascending by given word first and and ascending by
                    <em>name</em> second (if a tag does not contain the given
                    word)
                  </li>
                </ul>

              </div>

            </div>

          </div>

        </div>

      </div>

    </section>

  </div>
</template>

<script>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

import config from '@/config'

export default {
  name: 'User',
  data: function () {
    return {
      title: `Help – ${config.title}`
    }
  },
  components: {
    FontAwesomeIcon
  }
}
</script>
