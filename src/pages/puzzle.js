import React from "react"
import Layout from "../components/layout"
import Header from "../components/puzzleHeader"
import SEO from "../components/seo"
import Board from "../components/board"
import Tray from "../components/tray"
import queryString from "query-string"
import GameProvider from "../components/game"

const PuzzlePage = ( props ) => {
  const location = props.location;
  const qs = location.search ? queryString.parse(location.search) : {};
  const { id } = qs;

  return (
    <GameProvider>
      <Header id={id}/>
      <Layout>
        <SEO title="Block Race" />
        <Board/>
        <Tray/>
      </Layout>
    </GameProvider>
  )
}

export default PuzzlePage