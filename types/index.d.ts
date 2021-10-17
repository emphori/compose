/**
 * @todo Extract this "AssertType" type to its own library
 */
type AssertType<Actual extends Expected, Expected extends Identity, Identity = Actual> = any

/**
 * @todo Extract this "AssertExtends" type to its own library
 */
type AssertExtends<Target extends Source, Source> = any
