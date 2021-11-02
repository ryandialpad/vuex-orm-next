import { Schema as NormalizrSchema } from 'normalizr'
import { Schema } from '../../../schema/Schema'
import { Element, Collection } from '../../../data/Data'
import { Query } from '../../../query/Query'
import { Model } from '../../Model'
import { Relation, Dictionary } from './Relation'


export class MorphTo extends Relation {
  /**
   * The child model instance of the relation.
   */
  //protected child: Model

  /**
   * The field name that contains id of the parent model.
   */
  protected id: string

  /**
   * The field name that contains type of the parent model.
   */
  protected type: string

  /**
   * The local key of the parent model.
   */
   protected localKey: string

  /**
   * Create a new morph-to relation instance.
   */
  constructor(
    parent: Model,
    id: string,
    type: string,
    localKey: string
  ) {
    super(parent, parent)
    this.id = id
    this.type = type
    this.localKey = localKey
  }

  /**
   * Get all related models for the relationship. TODO
   */
  getRelateds(): Model[] {
    return [this.parent]
  }

  /**
   * Define the normalizr schema for the relation. TODO
   */
  define(schema: Schema): NormalizrSchema {
    //return schema.one(this.child, this.parent)
    console.log('type', this.type)
    schema.union((_value, parentValue) => {
      console.log('_value', _value)
      console.log('parentValue', parentValue)
      return parentValue[this.type]
    })
    console.log('got here!')
    return schema.union((_value, parentValue) => parentValue[this.type])
  }

  /**
   * Attach the relational key to the given record. Since morph to
   * relationship doesn't have any foreign key, it would do nothing.
   */
  attach(_record: Element, _child: Element): void {
    return;
  }

  /**
   * Set the constraints for an eager load of the relation. TODO
   */
  addEagerConstraints(query: Query, models: Collection): void {
    console.log('query', query)
    console.log('models', models)
    const types = this.getTypes(models)
    const database = this.parent.$database();
    console.log('types', types)
    //console.log('types[0]', types[0])
    //console.log('model', database.getModel(types[0]))

    //const relatedQuery = new Query(database, database.getModel(types[0]))
    //relatedQuery.where(this.id as any, models[0].id)
    //console.log('relatedQuery', relatedQuery)
    //console.log('relatedQuery get', relatedQuery.get())

    const relations = types.reduce((related, type) => {
      console.log('related', related)
      console.log('type', type)
      const relatedQuery = new Query(database, database.getModel(type))
      console.log('relatedQuery', relatedQuery)

      //related[type] = this.mapSingleRelations(relatedQuery.get(), '$id')

      return related
    }, {})
    console.log('relations', relations)
    //query.where(this.type as any, this.parent.$entity())
    //query.whereIn(this.id as any, this.getKeys(models, this.localKey))
  }

  /**
   * Match the eagerly loaded results to their respective parents. TODO
   */
  match(relation: string, models: Collection, results: Collection): void {
    console.log('relation', relation)
    console.log('models', models)
    console.log('results', results)
    const database = this.parent.$database();
    const dictionary = this.buildDictionary(results)
    console.log('dictionary', dictionary)

    models.forEach((model) => {
      const key = model[this.localKey]
      const relatedId = model[this.id]
      const relatedType = model[this.type]
      console.log('key', key)
      console.log('relatedId', relatedId)
      console.log('relatedType', relatedType)
      // TODO: figure out a better approach to get the related model using it's type that is connected to the parent's
      //       database
      const relatedModel = database.getModel(relatedType).$setDatabase(database)
      console.log('relatedModel', relatedModel)
      const related = relatedModel.$query().find(relatedId)
      console.log('related', related)

      /*
      console.log('dictionary[key]', dictionary[key])
      console.log('dictionary[key][0]', dictionary[key][0])*/

      related
        ? model.$setRelation(relation, related)
        : model.$setRelation(relation, null)
    })
    console.log('models updated', models)
  }

  /**
   * Build model dictionary keyed by the relation's foreign key.
   */
  protected buildDictionary(results: Collection): Dictionary {
    return this.mapToDictionary(results, (result) => {
      return [result[this.id], result]
    })
  }

  /**
   * Make a related model. TODO
   */
  make(/*element?: Element*/): Model | null {
    //return element ? this.child.$newInstance(element) : null
    return null
  }

  /**
   * Get all types from the collection.
   */
   getTypes(collection: Collection): string[] {
    return collection.reduce<string[]>((types, item) => {
      const type = item[this.type]

      !types.includes(type) && types.push(type)

      return types
    }, [] as string[])
  }
}
