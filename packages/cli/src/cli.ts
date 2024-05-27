#!/usr/bin/env node

import { Argument, Option, program } from '@commander-js/extra-typings'
import { API, status } from '@cryptgeon/shared'
import prettyBytes from 'pretty-bytes'

import { download } from './download.js'
import { parseFile, parseNumber } from './parsers.js'
import { getStdin } from './stdin.js'
import { upload } from './upload.js'
import { checkConstrains, exit } from './utils.js'

const defaultServer = process.env['CRYPTGEON_SERVER'] || 'https://cryptgeon.org'
const prefix = process.env['PREFIX_ROUTE'] || ''
const server = new Option('-s --server <url>', 'the cryptgeon server to use').default(defaultServer)
const files = new Argument('<file...>', 'Files to be sent').argParser(parseFile)
const text = new Argument('<text>', 'Text content of the note')
const password = new Option('-p --password <string>', 'manually set a password')
const all = new Option('-a --all', 'Save all files without prompt').default(false)
const url = new Argument('<url>', 'The url to open')
const views = new Option('-v --views <number>', 'Amount of views before getting destroyed').argParser(parseNumber)
const minutes = new Option('-m --minutes <number>', 'Minutes before the note expires').argParser(parseNumber)

// Node 18 guard
parseInt(process.version.slice(1).split(',')[0]) < 18 && exit('Node 18 or higher is required')

// @ts-ignore
const version: string = VERSION

program.name('cryptgeon').version(version).configureHelp({ showGlobalOptions: true })

program
  .command('info')
  .description('show information about the server')
  .addOption(server)
  .action(async (options) => {
    // setBase(options.server)
    const api = new API(options.server, prefix)
    const response = await status(api)
    const formatted = {
      ...response,
      max_size: prettyBytes(response.max_size),
    }
    for (const key of Object.keys(formatted)) {
      if (key.startsWith('theme_')) delete formatted[key as keyof typeof formatted]
    }
    console.table(formatted)
  })

const send = program.command('send').description('send a note')
send
  .command('file')
  .addArgument(files)
  .addOption(server)
  .addOption(views)
  .addOption(minutes)
  .addOption(password)
  .action(async (files, options) => {
    // setBase(options.server!)
    await checkConstrains(options)
    options.password ||= await getStdin()
    try {
      const url = await upload(files, { views: options.views, expiration: options.minutes, password: options.password, host: options.server! })
      console.log(`Note created:\n\n${url}`)
    } catch {
      exit('Could not create note')
    }
  })
send
  .command('text')
  .addArgument(text)
  .addOption(server)
  .addOption(views)
  .addOption(minutes)
  .addOption(password)
  .action(async (text, options) => {
    // setBase(options.server!)
    await checkConstrains(options)
    options.password ||= await getStdin()
    try {
      const url = await upload(text, { views: options.views, expiration: options.minutes, password: options.password, host: options.server! })
      console.log(`Note created:\n\n${url}`)
    } catch {
      exit('Could not create note')
    }
  })

program
  .command('open')
  .description('open a link with text or files inside')
  .addArgument(url)
  .addOption(password)
  .addOption(all)
  .action(async (note, options) => {
    try {
      const url = new URL(note)
      options.password ||= await getStdin()
      try {
        await download(url, options.all, options.password)
      } catch (e) {
        exit(e instanceof Error ? e.message : 'Unknown error occurred')
      }
    } catch {
      exit('Invalid URL')
    }
  })

program.parse()
