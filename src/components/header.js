import { Link } from "gatsby"
import React from "react"

const BasicHeader = () => {
  return (
    <header
      style={{
        background: `#111`,
        color: `white`
      }}
    >
      <div
        style={{
          margin: `0 auto`,
          maxWidth: 540,
          padding: `1rem 0.75rem`,
          display: `flex`
        }}
      >
        <h1 
          style={{ 
            margin: `auto auto auto 0`,
            fontSize: `1rem`
          }}
        >
          <Link
            to="/"
            style={{
              color: `white`,
              textDecoration: `none`,
            }}
          >
            {`Block Race`}
          </Link>
        </h1>
      </div>
    </header>
  )
}

export default BasicHeader
